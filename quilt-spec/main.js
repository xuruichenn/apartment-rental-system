const quilt = require('@quilt/quilt');
const nodeServer = require('./nodeServer');

const deployment = quilt.createDeployment({namespace: "TEMP-NAMESPACE", adminACL: ['0.0.0.0/0']});

var machine0 = new quilt.Machine({
    provider: "Amazon",
    size: "m4.large",
    sshKeys: quilt.githubKeys('TsaiAnson'),
});

var machine1 = new quilt.Machine({
    provider: "Amazon",
    size: "m4.large",
    sshKeys: quilt.githubKeys('TsaiAnson'),
    diskSize: 15,
});

var machine2 = new quilt.Machine({
    provider: "Amazon",
    size: "m4.large",
    sshKeys: quilt.githubKeys('TsaiAnson'),
    diskSize: 16,
});

var machine3 = new quilt.Machine({
    provider: "Amazon",
    size: "m4.large",
    sshKeys: quilt.githubKeys('TsaiAnson'),
    diskSize: 17,
});

var machine4 = new quilt.Machine({
    provider: "Amazon",
    size: "m4.xlarge",
    sshKeys: quilt.githubKeys('TsaiAnson'),
    diskSize: 32,
});

var countNode = 3;
const nodeRepository = 'tsaianson/node-apt-app';
const apartmentApp = new nodeServer(countNode, nodeRepository);

deployment.deploy(machine0.asMaster());
deployment.deploy(machine1.asWorker());
deployment.deploy(machine2.asWorker());
deployment.deploy(machine3.asWorker());
deployment.deploy(machine4.asWorker());

// Needs to be four machines! (Temporary)
apartmentApp.machPlacements([15, 16, 17, 32]);

deployment.deploy(apartmentApp);
