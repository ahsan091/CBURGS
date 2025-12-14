from flask import Flask, render_template, send_from_directory

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('components/about.html')

@app.route('/services')
def services():
    return render_template('components/services.html')

@app.route('/projects')
def projects():
    return render_template('components/projects.html')

@app.route('/insights')
def insights():
    return render_template('components/insights.html')

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
