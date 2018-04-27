const { Container, publicInternet } = require('@quilt/quilt');

function Kibana(es, port1) {
  this.container = new Container('kibana', 'kibana:4', {
    command: [
      '--port', port1.toString(),
      '--elasticsearch', es.uri(),
    ],
  });
  es.addClient(this.container);
  this.container.allowFrom(publicInternet, port1);
}

Kibana.prototype.deploy = function deploy(depl) {
  depl.deploy(this.container);
};

Kibana.prototype.placeOn = function placeOn(disk) {
	this.container.placeOn(disk);
}

Kibana.prototype.port = 5601;

exports.Kibana = Kibana;