from flask import Flask, render_template, send_from_directory
import requests
import markdown
import re
from datetime import datetime

app = Flask(__name__)

# Cache for blogs to avoid hitting GitHub API limits too often
BLOG_CACHE = {
    'files': {}, # Key: filename, Value: blog_dict
    'last_list_check': None
}

def fetch_github_blogs():
    """Fetches blog posts from the GitHub repository incrementally."""
    
    # Check for new files every 60 seconds (1 minute) for better responsiveness
    should_check_list = True
    if BLOG_CACHE['last_list_check']:
        time_diff = (datetime.now() - BLOG_CACHE['last_list_check']).total_seconds()
        if time_diff < 60:
            should_check_list = False
    
    # If we have data and don't need to check list yet, return cached values
    if not should_check_list and BLOG_CACHE['files']:
        return sorted(BLOG_CACHE['files'].values(), key=lambda x: x['date'], reverse=True)

    try:
        # 1. Get list of files from the repo
        repo_url = "https://api.github.com/repos/cyberburgs/cyberburgs-insights/contents"
        # User-Agent header is robust against GitHub API restrictions
        headers = {'User-Agent': 'Cyberburgs-Website'}
        
        # Always fetch the list to see what's new
        print("Checking GitHub file list...")
        response = requests.get(repo_url, headers=headers)
        
        if response.status_code != 200:
            # If list fetch fails, return whatever we have in cache
            return sorted(BLOG_CACHE['files'].values(), key=lambda x: x['date'], reverse=True)

        files = response.json()
        new_content_fetched = False

        for file in files:
            filename = file['name']
            file_sha = file['sha']
            
            if filename.endswith('.md') and filename != 'README.md':
                
                # SMART SYNC CHECK:
                # 1. Check if file is in cache
                # 2. Check if the SHA (content hash) matches
                if filename in BLOG_CACHE['files'] and BLOG_CACHE['files'][filename].get('sha') == file_sha:
                    # File exists and content is identical (SHA matched) -> SKIP
                    continue
                
                # If we are here, it's either a NEW file or an UPDATED file (SHA mismatch)
                action = "Updating" if filename in BLOG_CACHE['files'] else "Fetching new"
                print(f"{action} blog content: {filename}")
                
                content_response = requests.get(file['download_url'], headers=headers)
                if content_response.status_code == 200:
                    raw_content = content_response.text
                    
                    # Parse Frontmatter
                    metadata = {}
                    content_body = raw_content
                    frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', raw_content, re.DOTALL)
                    if frontmatter_match:
                        frontmatter_text = frontmatter_match.group(1)
                        content_body = frontmatter_match.group(2)
                        for line in frontmatter_text.split('\n'):
                            if ':' in line:
                                key, value = line.split(':', 1)
                                metadata[key.strip()] = value.strip()
                    
                    html_content = markdown.markdown(content_body)

                    blog_entry = {
                        'title': metadata.get('title', filename.replace('.md', '')),
                        'date': metadata.get('date', 'Unknown'),
                        'category': metadata.get('category', 'General'),
                        'author': metadata.get('author', 'Cyberburgs Team'),
                        'excerpt': metadata.get('description', content_body[:100] + '...'),
                        'content': html_content,
                        'url': file['html_url'], # Link to GitHub
                        'image': '/static/img/blog_1.png',
                        'filename': filename,
                        'sha': file_sha # Store SHA to track changes
                    }
                    
                    # Add to cache
                    BLOG_CACHE['files'][filename] = blog_entry
                    new_content_fetched = True

        BLOG_CACHE['last_list_check'] = datetime.now()
        
        # Return sorted list
        return sorted(BLOG_CACHE['files'].values(), key=lambda x: x['date'], reverse=True)
        
    except Exception as e:
        print(f"Error fetching blogs: {e}")
        return sorted(BLOG_CACHE['files'].values(), key=lambda x: x['date'], reverse=True)

@app.route('/')
def home():
    blogs = fetch_github_blogs()
    return render_template('index.html', blogs=blogs)

@app.route('/about')
def about():
    # Now correctly returns the about component, just like services/projects
    return render_template('components/about.html')

@app.route('/services')
def services():
    return render_template('components/services.html')

@app.route('/projects')
def projects():
    return render_template('components/projects.html')

@app.route('/insights')
def insights():
    blogs = fetch_github_blogs()
    return render_template('components/insights.html', blogs=blogs)

@app.route('/blog/<path:filename>')
def blog_post(filename):
    # Security check
    if '..' in filename or filename.startswith('/'):
        return "Invalid filename", 400

    # Ensure cache is fresh (respecting the 60s rate limit)
    # This call allows the system to detect updates even if we are just viewing a single post
    fetch_github_blogs()

    # Check Cache
    if filename in BLOG_CACHE['files']:
        return render_template('blog_post.html', post=BLOG_CACHE['files'][filename])
    
    return "Blog post not found", 404

@app.route('/contact')
def contact():
    return render_template('components/contact.html')

@app.route('/robots.txt')
def robots():
    return send_from_directory('static', 'robots.txt')

@app.route('/sitemap.xml')
def sitemap():
    return send_from_directory('static', 'sitemap.xml')

if __name__ == '__main__':
    app.run(debug=True)
