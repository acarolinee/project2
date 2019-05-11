import os, datetime

from flask import Flask, session, render_template, request, jsonify, json
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = 'b"\xdd\xa2x\xa1I/\xces\x05Kr\x9e\xad~t\xf8"' # os.getenv("SECRET_KEY")
socketio = SocketIO(app)


canales = {
    "bienvenida" : [],
    "general" : [], #FORMAT {"mensaje": "asd", "usuario": "juan", "hora": "08/05/2019 14:01"}
    "anuncios" : []
    }

listaCanales = list(canales.keys())

@app.route("/")
def index():

    # session.pop('username', None) # borrar esta linea despues

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

@app.route("/mensajes/<channelname>", methods=['GET'])
def mensaje(channelname):
    show_data = json.dumps(canales.get(channelname))
    return (show_data)

@socketio.on("submit message")
def enviar_mensaje(data):
    channelname = data["channelname"]
    mensaje = data["mensaje"]
    usuario = session['username']
    dateAhora = datetime.datetime.now()
    hora = dateAhora.strftime("%d/%m/%Y %H:%M")
    listaMensajes = canales.get(channelname)

    if len(listaMensajes) >= 100:
        del listaMensajes[0]

    listaMensajes.append({"mensaje": mensaje, "usuario": usuario, "hora": hora})

    emit("announce message", {"mensaje": mensaje, "usuario": usuario, "hora": hora}, broadcast=True)
