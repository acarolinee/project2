document.addEventListener('DOMContentLoaded', () => {

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {

        document.querySelector('#buttonCrearCanal').onclick = () => {
            const channelname = document.querySelector('#lbl_channelname').value;
            socket.emit('submit channel', {'channelname': channelname});
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
        a.setAttribute("class", "card-link text-secondary");
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
