import os, datetime

from flask import Flask, session, render_template, request, jsonify, json
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = 'b"\xdd\xa2x\xa1I/\xces\x05Kr\x9e\xad~t\xf8"' # os.getenv("SECRET_KEY")
socketio = SocketIO(app)


canales = {
    "bienvenida" : [],
    "general" : [], #FORMAT {"id": "1", "mensaje": "asd", "usuario": "juan", "hora": "08/05/2019 14:01"}
    "anuncios" : []
    }

listaCanales = list(canales.keys())

@app.route("/")
def index():

    # session.pop('username', None) # borrar esta linea despues
    canales = {
        "bienvenida" : [],
        "general" : [], #FORMAT {"id": "1", "mensaje": "asd", "usuario": "juan", "hora": "08/05/2019 14:01"}
        "anuncios" : []
    }
    
    listaCanales = list(canales.keys())

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
    listaCanales.append(channelname)
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

    # try:
    #     id = next(i for i, e in enumerate((listaMensajes), 1) if i != int(e["id"]))
    # except StopIteration:
    #     id = len(listaMensajes)+1

    try:
        id = int(listaMensajes[-1]["id"])+1
    except IndexError:
        id = 1
    listaMensajes.insert(id-1, {"id": str(id), "mensaje": mensaje, "usuario": usuario, "hora": hora})
    # listaMensajes.append({"id": id, "mensaje": mensaje, "usuario": usuario, "hora": hora})

    emit("announce message", {"id": str(id), "mensaje": mensaje, "usuario": usuario, "hora": hora, "channelname": channelname}, broadcast=True)

@socketio.on("delete message")
def eliminar_mensaje(data):
    channelname = data["channelname"]
    id = data["id"]
    listaMensajes = canales.get(channelname)

    del_position = listaMensajes.index(next(i for i in ((listaMensajes)) if i["id"] == id ))
    del listaMensajes[del_position]

    emit("remove message", {"id": id, "channelname": channelname}, broadcast=True)
