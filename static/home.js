document.addEventListener('DOMContentLoaded', () => {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {

        document.querySelector('#buttonCrearCanal').onclick = () => {
            const channelname = document.querySelector('#lbl_channelname').value;

            const element = Array.from(document.querySelectorAll('.canal')).find(link => link.innerHTML === channelname);

            const divFooter = document.querySelector('#modalFooterCrearCanal');
            const firstElementChild = divFooter.firstElementChild;
            var atributo = firstElementChild.getAttribute('class');
            if (atributo.includes('alert')){
                divFooter.removeChild(firstElementChild);
            }

            const divAlerta = document.createElement('div');
            divAlerta.setAttribute("role", "alert");

            if (typeof element === 'undefined'){
                socket.emit('submit channel', {'channelname': channelname});
                document.querySelector('#lbl_channelname').value = "";
                divAlerta.setAttribute("class", "alert alert-info mb-0");
                divAlerta.innerHTML = "¡Sala creada!";
            }
            else {
                divAlerta.setAttribute("class", "alert alert-danger mb-0");
                divAlerta.innerHTML = "Sala ya existe";
            }

            const firstChild = divFooter.firstChild;
            divFooter.insertBefore(divAlerta, firstChild);

        };

        document.querySelector('#buttonEnviarMensaje').onclick = () => {
            const mensaje = document.querySelector('#inputEnviarMensaje').value;
            const channelname = document.querySelector('#canal').innerHTML;
            socket.emit('submit message', {'mensaje': mensaje, 'channelname': channelname});
            document.querySelector('#inputEnviarMensaje').value = ""
        };

    });

    socket.on("announce channel", data => {
        const firstDiv = document.createElement('div');
        firstDiv.setAttribute("class", "card text-center mb-3");
        const secondDiv = document.createElement('div');
        secondDiv.setAttribute("class", "card-body");
        const h5 = document.createElement('h5');
        h5.setAttribute("class", "card-title");
        const a = document.createElement('a');
        a.setAttribute("class", "card-link text-info canal");
        a.setAttribute("href", "#");
        a.setAttribute("data-dismiss", "modal");
        a.innerHTML = data.channelname;
        a.onclick = () => {
            const request = new XMLHttpRequest();
            const channelname = a.innerHTML;
            request.open('GET', `/mensajes/${channelname}`);
            request.onload = () => {
                const data = JSON.parse(request.responseText);
                document.querySelector('#canal').innerHTML = channelname;
            };
            request.send();
        };
        h5.appendChild(a);
        secondDiv.appendChild(h5);
        firstDiv.appendChild(secondDiv);
        document.querySelector('#modalBodyListaCanales').append(firstDiv);
        // document.querySelector('#modalBodyListaCanales').append(`<div class="card border-secondary text-center"><div class="card-body"><h5 class="card-title"><a class="card-link" href="#">${data.channelname}</a></h5><!-- <p class="card-text"></p> --></div></div>`);
    });

    document.querySelectorAll('.canal').forEach(link => {
        link.onclick = () => {
            const request = new XMLHttpRequest();
            const channelname = link.innerHTML;

            request.open('GET', `/mensajes/${channelname}`);

            request.onload = () => {
                const data = JSON.parse(request.responseText);
                document.querySelector('#canal').innerHTML = channelname;

                const chat = document.querySelector('#chat');

                while(chat.firstChild){
                    chat.removeChild(chat.firstChild);
                };

                data.forEach(dato => {
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
                });

            };

            // const data = new FormData();
            // data.append('channelname', channelname);

            request.send();

        };
    });

    socket.on("announce message", data => {

        const chat = document.querySelector('#chat');
        let cantidad_mensajes = chat.children.length;
        if (cantidad_mensajes > 100){
            chat.removeChild(chat.firstChild);
        }

        const hr = document.createElement('hr');
        const firstDiv = document.createElement('div');
        firstDiv.setAttribute("class", "row");
        const secondDiv = document.createElement('div');
        secondDiv.setAttribute("class", "col");
        const usuario = document.createElement('strong');
        usuario.innerHTML = data["usuario"];
        const usuarioHora = document.createElement('p');
        usuarioHora.appendChild(usuario);
        usuarioHora.innerHTML += ' ' + data["hora"];
        const mensaje = document.createElement('p');
        mensaje.innerHTML = data["mensaje"];

        secondDiv.appendChild(hr);
        secondDiv.appendChild(usuarioHora);
        secondDiv.appendChild(mensaje);
        firstDiv.appendChild(secondDiv);

        // chat.append(hr);
        chat.append(firstDiv);

        const divChat = document.querySelector('#divChat');
        divChat.scrollTop = divChat.scrollHeight;

    });

});
