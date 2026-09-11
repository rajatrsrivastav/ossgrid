### CoreDNS
##### [Add ACME protocol support for certificate management with DNS](https://mentorship.lfx.linuxfoundation.org/project/beb3a680-3f78-4716-b072-7f547cf417ab)

- [CoreDNS](https://github.com/coredns/coredns) is a cloud-native DNS server with a focus on service discovery. While best known as the default DNS server for Kubernetes, CoreDNS is capable of handle many other scenarios within or outside of Kubernetes clusters for make easy infrastructure management. One such case is the certificate management. This project is to provide ACME protocol support so that it is possible to have automatic certificate management through CoreDNS. More details and discussions are available in <https://github.com/coredns/coredns/issues/3460>.
- Recommended Skills: Golang, DNS, TLS, Certificate Management
- Mentor(s): Yong Tang (@yongtang), Paul Greenberg (@greenpau)
- Issue: <https://github.com/coredns/coredns/issues/3460>

### Kyverno
##### Extend Kyverno CLI test command for Generate policy rules

- **Description**: [Kyverno](https://kyverno.io) is a Kubernetes native policy engine that secures and automates Kubernetes configurations. This project extends the Kyverno CLI to cover generate policies and improve tests coverage for Kyverno, based on the test results. The enhancement will involve extending the test command for generate policy rules, adding more test cases for the samples, and automating execution of tests.
- **Recommended Skills**: Golang, Kubernetes, Test, Automation
- **Mentor(s)**: Prateek Pandey (@prateekpandey14)
- **Upstream Issue (URL)**: <https://github.com/kyverno/kyverno/issues/3114>
- LFX URL: <https://mentorship.lfx.linuxfoundation.org/project/6b79b7b7-7f30-4891-bdb1-5798ea207bef>

### KubeArmor
#### Implement DNS visibility with KubeArmor

* Description: The project aims to provide better visibility into the domains accessed from pods, with a focus on identifying and containing attacks that use techniques like Domain Generation Algorithms (DGA) to connect to remote command and control (C&C) servers. By gathering information on which domains are being accessed and applying network rules to allow only specific domains, the project aims to empower security operations (secops) teams to better prevent and respond to such attacks.
* Expected Outcome:  
  * KubeArmor to emit telemetry events for any DNS lookups from any pods.
  * Ability to see egress DNS lookups done from any pods using karmor summary.
  * Documentation
* Recommended Skills: Go, K8s, familiarity with network security and a basic understanding of KubeArmor is a plus.
* Mentors:
  * Anurag Kumar (@kranurag7, contact.anurag7@gmail.com)
  * Barun Acharya (@daemon1024, barun1024@gmail.com)
  * Ankur Kothiwal (@Ankurk99, ankur.kothiwal99@gmail.com)
* Upstream Issue: [Issue #1219](https://github.com/kubearmor/KubeArmor/issues/1219)
- LFX URL: https://mentorship.lfx.linuxfoundation.org/project/cfa22331-36f3-4d20-abf0-667a31fd2ba8

### Meshery
#### Workflow Engine in Meshery

CNCF - Meshery: Workflow engine integration (2026 Term 1)

Description: Integrate a new architectural component into Meshery: a workflow engine, using Temporal. This project involves shifting Meshery off of sqlite over to postgres using gorm (golang). Interns will familiarize with concepts of orchestration engines, including chaining workflows, and content lifecycle management.
Recommended Skills: Golang, Temporal, ReactJS