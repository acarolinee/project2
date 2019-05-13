// localStorage.clear();

if (localStorage.getItem('channelname')){
    MenuAgregarLastChannel();
}

document.addEventListener('DOMContentLoaded', () => {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {

        document.querySelector('#buttonCrearCanal').onclick = () => {
            const channelname = document.querySelector('#lbl_channelname').value;

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
                document.querySelector('#lbl_channelname').value = "";
                $('#modalCrearCanal').modal('hide');
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
            const request = new XMLHttpRequest();
            const channelname = link.innerHTML;
            request.open('GET', `/mensajes/${channelname}`);
            request.onload = () => {
                const data = JSON.parse(request.responseText);
                document.querySelector('#canal').innerHTML = channelname;

                localStorage.setItem('channelname', channelname);

                if(document.querySelector("#lastChannel")){
                    document.querySelector("#lastChannel").innerHTML = link.innerHTML;
                }
                else{
                    MenuAgregarLastChannel();
                }

                const chat = document.querySelector('#chat');

                while(chat.firstChild){
                    chat.removeChild(chat.firstChild);
                };
            };
            request.send();
        };
        h5.appendChild(link);
        secondDiv.appendChild(h5);
        firstDiv.appendChild(secondDiv);
        document.querySelector('#modalBodyListaCanales').append(firstDiv);
        link.click();

        if(document.querySelector("#lastChannel")){
            document.querySelector("#lastChannel").innerHTML = link.innerHTML;
        }
        else{
            MenuAgregarLastChannel();
        }

        const chat = document.querySelector('#chat');

        while(chat.firstChild){
            chat.removeChild(chat.firstChild);
        };

    });

    document.querySelectorAll('.canal').forEach(link => {
        link.onclick = () => {

            localStorage.setItem('channelname', link.innerHTML);

            ChatCargarMensajes(link);

            if(document.querySelector("#lastChannel")){
                document.querySelector("#lastChannel").innerHTML = link.innerHTML;
            }
            else{
                MenuAgregarLastChannel();
            }

        };
    });

    socket.on("announce message", dato => {

        const chat = document.querySelector('#chat');
        let cantidad_mensajes = chat.children.length;
        if (cantidad_mensajes >= 100){
            chat.removeChild(chat.firstChild);
        }

        AgregarMensaje(dato);

        const divChat = document.querySelector('#divChat');
        divChat.scrollTop = divChat.scrollHeight;

    });

    if(document.querySelector("#lastChannel")){
        document.querySelector("#lastChannel").click();
    }

});

function MenuAgregarLastChannel() {
    const divRowMenu = document.querySelector("#rowMenu");
    const div = document.createElement('div');
    div.setAttribute("class", "col-lg-12 bg-dark");
    const link = document.createElement('a');
    link.setAttribute("class", "nav-link text-light");
    link.setAttribute("href", "#");
    link.setAttribute("id", "lastChannel")
    link.innerHTML = localStorage.getItem('channelname');
    link.onclick = () => {
        ChatCargarMensajes(link);
    };

    div.appendChild(link);
    divRowMenu.appendChild(div);
}

function ChatCargarMensajes(link) {
    const request = new XMLHttpRequest();
    const channelname = link.innerHTML;

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
    const secondDiv = document.createElement('div');
    secondDiv.setAttribute("class", "col");
    const usuario = document.createElement('strong');
    usuario.innerHTML = dato["usuario"];
    const usuarioHora = document.createElement('p');
    usuarioHora.appendChild(usuario);
    usuarioHora.innerHTML += ' ' + dato["hora"];
    const mensaje = document.createElement('p');
    mensaje.innerHTML = dato["mensaje"];

    secondDiv.appendChild(hr);
    secondDiv.appendChild(usuarioHora);
    secondDiv.appendChild(mensaje);
    firstDiv.appendChild(secondDiv);

    // chat.append(hr);
    chat.append(firstDiv);
}
