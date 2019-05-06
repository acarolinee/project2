import os

from flask import Flask, session, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = 'b"\xdd\xa2x\xa1I/\xces\x05Kr\x9e\xad~t\xf8"' # os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():

    session.pop('username', None)

    if 'username' in session:
        return render_template("home.html")
    else:
        return render_template("login.html")

    # return "Project 2: TODO"

@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        session['username'] = request.form['username']
        return render_template("home.html")
    else:
        return render_template("login.html")
