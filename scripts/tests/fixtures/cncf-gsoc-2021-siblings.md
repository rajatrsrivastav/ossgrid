### Pravega

#### Dynamic Auto-scaling

- Description: Dynamic scaling of the Pravega Cluster by the [pravega-operator](https://github.com/pravega/pravega-operator) using [HPA](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/). This should be simple to implement, and we've already done [a successful POC](https://github.com/pravega/pravega-operator/issues/131).
- Recommended Skills: Go, Kubernetes
- Mentor(s): Prajakta Belgundi (@pbelgundi)
- Upstream Issue (URL): https://github.com/pravega/pravega-operator/issues/483

### Write logs to Pravega

- Description: Create a Log4j appender or syslog listener that will write application events to a Stream (record timestamps, event types, etc).
- Recommended Skills: Java, Rust, Python, C#, a language with gRPC bindings
- Mentor(s): Andrei Paduroiu (@andreipaduroiu)

### SLTS ChunkStorage implementations

- Description: [Simplified Long Term Storage](https://www.youtube.com/watch?v=Qyd1_t3c6LE) allows Pravega to use almost any storage API for Stream storage. Pravega has ChunkStorage implementations for [Extended S3 (ECS)](https://github.com/pravega/pravega/blob/master/bindings/src/main/java/io/pravega/storage/extendeds3/ExtendedS3ChunkStorage.java), [HDFS](https://github.com/pravega/pravega/blob/master/bindings/src/main/java/io/pravega/storage/hdfs/HDFSChunkStorage.java), [NFS](https://github.com/pravega/pravega/blob/master/bindings/src/main/java/io/pravega/storage/filesystem/FileSystemChunkStorage.java) and [BookKeeper/BlobIt](https://github.com/diegosalvi/pravega-blobit-chunkmanager). Write a [ChunkStorage](https://github.com/pravega/pravega/blob/master/segmentstore/storage/src/main/java/io/pravega/segmentstore/storage/chunklayer/ChunkStorage.java) implementation for GCP or Azure.
- Recommended Skills: Java
- Mentor(s): Sachin Joshi (@sachin-j-joshi)
