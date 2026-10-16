- [Project Ideas](#project-ideas)
  - [Argo](#argo)
    - [Memoization storage](#memoization-storage)
    - [UI plugins](#ui-plugins)
    - [Count-based enhanced depends logic](#count-based-enhanced-depends-logic)
  - [Buildpacks](#buildpacks)
    - [Standardize Cache Flag options](#standardize-cache-flag-options)
    - [Proof of concept for lifecycle registry only approach](#proof-of-concept-for-lifecycle-registry-only-approach)
  - [Kubernetes](#kubernetes)
    - [Kubebuilder (https://github.com/kubernetes-sigs/kubebuilder)](#kubebuilder-httpsgithubcomkubernetes-sigskubebuilder)
      - [New Golang plugin to help Operator authors skill up (Size: Medium)](#new-golang-plugin-to-help-operator-authors-skill-up-size-medium)
      - [New Grafana dashboard plugin for visualizing controller-runtime metrics (size: medium)](#new-grafana-dashboard-plugin-for-visualizing-controller-runtime-metrics-size-medium)

### Kubernetes

#### Kubebuilder (https://github.com/kubernetes-sigs/kubebuilder)

##### New Golang plugin to help Operator authors skill up (Size: Medium)

- Description: Your goal is to develop a [Kubebuilder Plugin](https://book.kubebuilder.io/plugins/plugins.html) which generates the files with all possible common desired source code implementation for an Operator Author to achieve the goal of deploying an Operand(image/Pod) following the [Operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) and common best practices and recommendations such as using [StatusConditionals](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#typical-status-properties), tests, etc. Note that we can begin implementing this plugin with basic implementation and then start to provide many follow-ups as much we wish to grow it incrementally. This plugin can help a lot of Operator Authors save time and give good direction and start to point to them. You can begin by following, for example, the quick tutorial [Golang Operator](https://sdk.operatorframework.io/docs/building-operators/golang/tutorial/) and the document [Common recommendations and suggestions](https://sdk.operatorframework.io/docs/best-practices/common-recommendation/) to have an idea of how Operators works and what code this plugin would generate by default. It is ideal for those who are looking to know more about [Operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) and its good practices, how to develop tests and ensure the quality and maintainability of solutions.
- Expected outcome: Implementation of a new Golang Plugin in Kubebuilder to generate scaffolds required to deploy and manage an image on the cluster. Other possibe outcomes are to provide examples of the code implementation and recommend best practices in documentation.
- Recommended Skills: Golang, Kubernetes, Operators
- Mentor(s): Camila Macedo (@camilamacedo86) and Rashmi Gottipati(@rashmigottipati)
- Expected project size: 175 Hours
- Difficulty: Medium
- Upstream Issue (URL): https://github.com/kubernetes-sigs/kubebuilder/blob/master/designs/code-generate-image-plugin.md

##### New Grafana dashboard plugin for visualizing controller-runtime metrics (size: medium)

- Description: Your goal is to develop a [Kubebuilder Plugin](https://book.kubebuilder.io/plugins/plugins.html) which will generate the manifests required to provide Grafana dashboards for visualizing the default [metrics exported](https://book.kubebuilder.io/reference/metrics.html). You can begin by first looking into the requirements for exporting the controller-runtime metrics and steps to create a custom dashboard. After figuring out the configuration files which are needed, we can start by creating a plugin when invoked scaffolds them. The plugins [here](https://github.com/operator-framework/operator-sdk/tree/master/internal/plugins) can give a good idea on how they work. An extended goal would be to figure out on how we can make it available on https://grafana.com/grafana/dashboards for users to be able to easily export it.
- Expected outcome: Create a plugin, when invoked scaffolds out the required manifests for integrating Grafana dashboard. Make the Grafana dashboard available in https://grafana.com/grafana/dashboards based on the inputs from the community.
- Recommended Skills: Golang, Kubernetes
- Mentor(s): Varsha Prasad (@varshaprasad96)
- Expected project size: 175 Hours
- Difficulty: Medium
- Upstream Issue (URL): https://github.com/kubernetes-sigs/kubebuilder/issues/2183

#### Cluster API Provider GCP

##### Improve CAPG by adding more features and support GKE

- Description: [CAPG](https://github.com/kubernetes-sigs/cluster-api-provider-gcp) is a subporject under the SIG-Cluster-LifeCycle and it is an implementation for GCP of Cluster-API which is a Kubernetes sub-project focused on providing declarative APIs and tooling to simplify provisioning, upgrading, and operating multiple Kubernetes clusters.
- Expected outcome: This work will bring CAPG inline with CAPA and CAPZ, both of which support creating unmanaged and managed clusters.
- Recommended Skills: Golang, Kubernetes
- Mentor(s): Carlos Panato (@cpanato), Davanum Srinivas (@dims), Richard Case (@richardcase), Winnie Kwon (@pydctw)
- Expected project size: 175 Hours
- Difficulty: Medium
- Upstream Issue (URL): https://github.com/kubernetes-sigs/cluster-api-provider-gcp/issues/512 / https://github.com/kubernetes-sigs/cluster-api-provider-gcp/issues/478 / https://github.com/kubernetes-sigs/cluster-api-provider-gcp/issues/289

#### Cluster API Provider AWS

##### Improve observability of CAPA

- Description: Cluster API Provider AWS (CAPA) is a subproject of SIG Cluster Lifecycle that extends Cluster API to simplify lifecycle management of Kubernetes clusters on AWS.
  The focus of this project is to improve the observability of CAPA by integrating it with observability tools such as OpenTelemetry/Jaeger/Prometheus.
  With the help of metrics/traces emitted by these observability integrations, users will easily analyze CAPA's behaviour and performance.
  This project will also focus on improving developer experience with OpenTelemetry collectors and by documenting the integration steps.
- Expected outcome: The main outcome is to instrument CAPA to export OpenTelemetry trace and improve the metrics exposed.
  Another outcome is to improve development environment by deploying OpenTelemetry for collecting traces, Jaeger and Prometheus for viewing traces and visualizing metrics.
- Recommended Skills: Golang, Kubernetes, observability tools (such as OpenTelemetry/Jaeger/Prometheus)
- Mentor(s): Sedef Savas (@sedefsavas) Richard Case (@richcase)
- Expected project size: 350 Hours
- Difficulty: Medium
- Upstream Issue (URL): https://github.com/kubernetes-sigs/cluster-api-provider-aws/issues/2178

### KubeVela
