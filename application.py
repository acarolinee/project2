import os

from flask import Flask, session, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = 'b"\xdd\xa2x\xa1I/\xces\x05Kr\x9e\xad~t\xf8"' # os.getenv("SECRET_KEY")
socketio = SocketIO(app)

canales = {
    "bienvenida" : [],
    "general" : [],
    "anuncios" : []
    }

listaCanales = list(canales.keys())

@app.route("/")
def index():

    session.pop('username', None) # borrar linea despues

    if 'username' in session:
        return render_template("home.html", listaCanales=listaCanales)
    else:
        return render_template("login.html")

@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        session['username'] = request.form['username']
        return render_template("home.html", listaCanales=listaCanales)
    else:
        if 'username' in session:
            return render_template("home.html", listaCanales=listaCanales)
        else:
            return render_template("login.html")

@socketio.on("submit channel")
def channel(data):
    channelname = data["channelname"]
    canales.update({ channelname : [] })
    emit("announce channel", {'channelname': channelname}, broadcast=True)
