// localStorage.clear();

if (localStorage.getItem('channelname')){
    menuAgregarLastChannel();
}

var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

document.addEventListener('DOMContentLoaded', () => {

    // var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {

        document.querySelector('#buttonCrearCanal').onclick = () => {
            const channelname = document.querySelector('#lbl-channelname').value;

            const element = Array.from(document.querySelectorAll('.canal')).find(link => link.innerHTML === channelname);

            const divFooter = document.querySelector('#modalFooterCrearCanal');
            const firstElementChild = divFooter.firstElementChild;
            var atributo = firstElementChild.getAttribute('class');
            if (atributo && atributo.includes('alert')){
                divFooter.removeChild(firstElementChild);
            }

            const divAlerta = document.createElement('div');
            divAlerta.setAttribute("role", "alert");

            if (typeof element === 'undefined'){
                socket.emit('submit channel', {'channelname': channelname});
                document.querySelector('#lbl-channelname').value = "";
                $('#modalCrearCanal').modal('hide');

                localStorage.setItem('channelname', channelname);
                chatCargarMensajes(channelname);
                if(document.querySelector("#lastChannel")){
                    document.querySelector("#lastChannel").innerHTML = link.innerHTML;
                }
                else{
                    menuAgregarLastChannel();
                }

                // divAlerta.setAttribute("class", "alert alert-info mb-0");
                // divAlerta.innerHTML = "¡Sala creada!";
            }
            else {
                divAlerta.setAttribute("class", "alert alert-danger mb-0");
                divAlerta.innerHTML = "Sala ya existe";
            }

            const firstChild = divFooter.firstChild;
            divFooter.insertBefore(divAlerta, firstChild);

        };

        document.querySelector('#formEnviarMensaje').onsubmit = () => {
            const mensaje = document.querySelector('#inputEnviarMensaje').value;
            if (mensaje){
                const channelname = document.querySelector('#canal').innerHTML;
                socket.emit('submit message', {'mensaje': mensaje, 'channelname': channelname});
                document.querySelector('#inputEnviarMensaje').value = "";
            }
            return false;
        };

    });

    socket.on("announce channel", data => {
        const firstDiv = document.createElement('div');
        firstDiv.setAttribute("class", "card text-center mb-3");
        const secondDiv = document.createElement('div');
        secondDiv.setAttribute("class", "card-body");
        const h5 = document.createElement('h5');
        h5.setAttribute("class", "card-title");
        const link = document.createElement('a');
        link.setAttribute("class", "card-link text-info canal");
        link.setAttribute("href", "#");
        link.setAttribute("data-dismiss", "modal");
        link.innerHTML = data.channelname;
        link.onclick = () => {

            const channelname = link.innerHTML;
            localStorage.setItem('channelname', channelname);
            chatCargarMensajes(channelname);
            if(document.querySelector("#lastChannel")){
                document.querySelector("#lastChannel").innerHTML = channelname;
            }
            else{
                menuAgregarLastChannel();
            }

        };
        h5.appendChild(link);
        secondDiv.appendChild(h5);
        firstDiv.appendChild(secondDiv);
        document.querySelector('#modalBodyListaCanales').append(firstDiv);

        // link.click();

    });

    document.querySelectorAll('.canal').forEach(link => {
        link.onclick = () => {

            const channelname = link.innerHTML
            localStorage.setItem('channelname', channelname);

            chatCargarMensajes(channelname);

            if(document.querySelector("#lastChannel")){
                document.querySelector("#lastChannel").innerHTML = channelname;
            }
            else{
                menuAgregarLastChannel();
            }

        };
    });

    socket.on("announce message", dato => {

        const canal = document.querySelector('#canal').innerHTML;

        if (canal == dato["channelname"]){
            const chat = document.querySelector('#chat');
            let cantidadMensajes = chat.children.length;
            if (cantidadMensajes >= 100){
                chat.removeChild(chat.firstChild);
            }

            AgregarMensaje(dato);

            const divChat = document.querySelector('#divChat');
            divChat.scrollTop = divChat.scrollHeight;
        }

    });

    if(document.querySelector("#lastChannel")){
        document.querySelector("#lastChannel").click();
    }

    socket.on("remove message", dato => {

        const canal = document.querySelector('#canal').innerHTML;
        if (canal == dato["channelname"]){
            const chat = document.querySelector('#chat');
            if (chat.hasChildNodes()) {
                var children = chat.childNodes;

                for (var i = 0; i < children.length; i++) {
                    if (children[i].dataset.id == dato["id"]){
                        chat.removeChild(children[i]);
                        break;
                    }
                }
            }
        }

    });

});

function menuAgregarLastChannel() {
    const divRowMenu = document.querySelector("#rowMenu");
    const div = document.createElement('div');
    div.setAttribute("class", "col-lg-12 bg-dark");
    const link = document.createElement('a');
    link.setAttribute("class", "nav-link text-light");
    link.setAttribute("href", "#");
    link.setAttribute("id", "lastChannel")
    link.innerHTML = localStorage.getItem('channelname');
    link.onclick = () => {
        chatCargarMensajes(link.innerHTML);
    };

    div.appendChild(link);
    divRowMenu.appendChild(div);
}

function chatCargarMensajes(newChannelname) {
    const request = new XMLHttpRequest();
    const channelname = newChannelname;

    // localStorage.setItem('channelname', channelname);

    request.open('GET', `/mensajes/${channelname}`);

    request.onload = () => {
        const data = JSON.parse(request.responseText);
        document.querySelector('#canal').innerHTML = channelname;

        const chat = document.querySelector('#chat');

        while(chat.firstChild){
            chat.removeChild(chat.firstChild);
        };

        data.forEach(dato => {
            AgregarMensaje(dato);
        });

    };

    // const data = new FormData();
    // data.append('channelname', channelname);

    request.send();
}

function AgregarMensaje(dato) {
    const hr = document.createElement('hr');
    const firstDiv = document.createElement('div');
    firstDiv.setAttribute("class", "row");
    firstDiv.setAttribute("data-id", dato["id"]);
    const secondDiv = document.createElement('div');
    secondDiv.setAttribute("class", "col");
    const thirdDiv = document.createElement('div');
    thirdDiv.setAttribute("class", "col");
    const fourthDiv = document.createElement('div');
    fourthDiv.setAttribute("class", "col");
    const usuario = document.createElement('strong');
    usuario.innerHTML = dato["usuario"];
    const row = document.createElement('div');
    row.setAttribute("class", "row");
    const usuarioHora = document.createElement('p');
    usuarioHora.setAttribute("style", "float:left");
    usuarioHora.appendChild(usuario);
    usuarioHora.innerHTML += ' ' + dato["hora"];
    const mensaje = document.createElement('p');
    mensaje.innerHTML = dato["mensaje"];

    const button = document.createElement('button');
    button.setAttribute("class", "close ml-0");
    button.setAttribute("type", "button");
    const span = document.createElement('span');
    span.setAttribute("aria-hidden", "true");
    span.innerHTML = "&times;";

    button.appendChild(span);

    button.onclick = () => {
        const channelname = document.querySelector('#canal').innerHTML;
        socket.emit('delete message', {'channelname': channelname, 'id': dato["id"]});
    };

    thirdDiv.appendChild(usuarioHora);
    if (document.querySelector("#linkUser").dataset.user == usuario.innerHTML){
        thirdDiv.appendChild(button);
    }

    row.appendChild(thirdDiv);

    fourthDiv.appendChild(mensaje);

    secondDiv.appendChild(hr);
    secondDiv.appendChild(row);
    secondDiv.appendChild(fourthDiv);
    firstDiv.appendChild(secondDiv);

    // chat.append(hr);
    chat.append(firstDiv);
}
