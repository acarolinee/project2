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
        h5.appendChild(a);
        secondDiv.appendChild(h5);
        firstDiv.appendChild(secondDiv);
        document.querySelector('#modalBodyListaCanales').append(firstDiv);
        // document.querySelector('#modalBodyListaCanales').append(`<div class="card border-secondary text-center"><div class="card-body"><h5 class="card-title"><a class="card-link" href="#">${data.channelname}</a></h5><!-- <p class="card-text"></p> --></div></div>`);
    });

});
