var quilt = require("@quilt/quilt");

var spark = require("./spark.js");

spark.setImage("osalpekar/spark-image-compressor");

var cmd = "spark-submit --master spark://spark-ms.q:7077 --py-files helper_functions.py,constants.py,spark_image_compressor.py run_image_processor.py -i test/test1.jpg -o test/test_out.jpg";

var nWorker = 2;

var config = {'executor_mem': '25g', 'worker_mem': '30g', 'executor_cores': '4'}

var sprk = new spark.Spark(1, nWorker)
    .exposeUIToPublic()
    .job(cmd);

exports.sprk = sprk;
