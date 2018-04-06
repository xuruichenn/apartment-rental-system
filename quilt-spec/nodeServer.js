const { Container, publicInternet } = require('@quilt/quilt');
const haproxy = require('@quilt/haproxy');
const Kibana = require('./kibana.js').Kibana;
const spark = require('./sparkImgProc.js').sprk;
const elasticsearch = require('@quilt/elasticsearch');

function nodeServer(count, nodeRepo) {
    this.pw = 'runner';
    this.instance_number = count;

    this.elastic = new elasticsearch.Elasticsearch(1);

    this.logstash = new Container('logstash', 'hantaowang/logstash-postgres');

    this.kib = new Kibana(this.elastic);
    this.kib1 = new Kibana(this.elastic);
    this.kib2 = new Kibana(this.elastic);
    this.kib3 = new Kibana(this.elastic);

    this.spark = spark;

    this.postgresPort = '5432';

    this.postgres = new Container('postgres', 'library/postgres:9.4', {
        env: {
            'password': this.pw,
            'port': this.postgresPort,
        }
    });

    this.mysql = new Container('mysql', 'mysql:5.6.32', {
        env: {
            MYSQL_USER: 'user',
            MYSQL_PASSWORD: this.pw,
            MYSQL_DATABASE: 'my_db',
            MYSQL_ROOT_PASSWORD: this.pw
        }
    });

    this.mysqlHost = this.mysql.getHostname();
    this.postgresURL = 'postgresql://postgres:runner@' + this.postgres.getHostname() + ':5432/postgres';
    this.postgresHost = 'postgresql://postgres:runner@' + this.postgres.getHostname();

    this.app = new Container('aptApp', nodeRepo, {
        command: ['node', 'server.js', '--port', '80'],
	env:{
        'mySQLHost': this.mysqlHost,
        'elasticURL': this.elastic.uri(),
        'postgresURL': this.postgresURL,
        'PW': this.pw,
        'HOST': this.postgresHost,
        'PORT': this.postgresPort,
		},
    }).replicate(this.instance_number);

    this.proxy = haproxy.simpleLoadBalancer(this.app);
    this.proxy.allowFrom(publicInternet, haproxy.exposedPort);

    for (i = 0; i < this.instance_number; i++) {
        this.elastic.addClient(this.app[i]);
        this.app[i].allowFrom(this.postgres, 5432);
        this.postgres.allowFrom(this.app[i], 5432);
        this.app[i].allowFrom(this.mysql, 3306);
        this.mysql.allowFrom(this.app[i], 3306);
    }

    this.elastic.addClient(this.logstash);
    this.logstash.allowFrom(this.postgres, 5432);
    this.postgres.allowFrom(this.logstash, 5432);

    this.mysql.allowFrom(spark.masters, 3306);
    this.mysql.allowFrom(spark.workers, 3306);

    this.machPlacements = function machPlacements(diskSizes) {
        /*** Dedicated Spark Machine (avoids noisy neighbor - see below )***/
        // First machine
        this.elastic.placeOn({diskSize: diskSizes[0]});
        this.kib.placeOn({diskSize: diskSizes[0]});

        // Second Machine
        this.app[0].placeOn({diskSize: diskSizes[1]});
        this.proxy.placeOn({diskSize: diskSizes[1]});
        this.postgres.placeOn({diskSize: diskSizes[1]});

        // Third Machine
        this.app[1].placeOn({diskSize: diskSizes[2]});
        this.app[2].placeOn({diskSize: diskSizes[2]});
        this.kib1.placeOn({diskSize: diskSizes[2]});

        // Fourth Machine
        this.mysql.placeOn({diskSize: diskSizes[3]});
        this.kib2.placeOn({diskSize: diskSizes[3]});

        // Fifth Machine
        this.logstash.placeOn({diskSize: diskSizes[4]});
        this.kib3.placeOn({diskSize: diskSizes[4]});


        // Sixth Machine (Dedicated Spark)
        this.spark.placeOn([diskSizes[5], diskSizes[5], diskSizes[5]]);

        /*** Evenly placed (possible noisy neighbor SPARK for CPU-QUOTA) ***/
        // // First Machine
        // this.elastic.placeOn({diskSize: diskSizes[0]});
        // this.logstash.placeOn({diskSize: diskSizes[0]});
        // this.kib.placeOn({diskSize: diskSizes[0]});

        // // Second Machine
        // this.app[0].placeOn({diskSize: diskSizes[1]});
        // this.proxy.placeOn({diskSize: diskSizes[1]});

        // // Third Machine
        // this.app[1].placeOn({diskSize: diskSizes[2]});
        // this.mysql.placeOn({diskSize: diskSizes[2]});

        // // Fourth Machine
        // this.app[2].placeOn({diskSize: diskSizes[3]});
        // this.postgres.placeOn({diskSize: diskSizes[3]});

        // // Separate function for spark
        // this.spark.placeOn([diskSizes[1], diskSizes[2], diskSizes[3]]);
    };

    this.deploy = function deploy(deployment) {
        deployment.deploy([this.proxy, this.elastic, this.logstash, this.postgres, this.mysql, this.kib, this.kib1, this.kib2, this.kib3]);
        for (i = 0; i < this.instance_number; i++) {
            deployment.deploy(this.app[i]);
        }
        this.spark.deploy(deployment);
    };
}

 module.exports = nodeServer;
