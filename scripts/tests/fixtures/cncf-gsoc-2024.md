## Project Ideas

If you are a project maintainer and consider mentoring during the GSoC 2024 cycle, please, submit your ideas below using the template.

[Google summer of code timeline](https://developers.google.com/open-source/gsoc/timeline).

You can find the project ideas from previous year [here](./2023.md).

> **NOTE:** Please note that GSoC is a program known for its strict deadlines. In addition to responding to your mentee on time, you will be required to submit evaluations on time. Failures to meet the deadlines might affect CNCF's future participation in GSoC.

---

### Template

```
#### CNCF Project Name

##### Project Title

- Description:
- Expected Outcome:
- Recommended Skills:
- Expected project size: # one of small (~90 hour projects), medium (~175 hour projects) and large (~350 hour projects)
- Mentor(s): #For GSoC, it is **required** to have at least 2 mentors with 1 being a primary mentor.
  - Jane Doe (@jane-github, jane@email.address) - primary
  - John Doe (@john-github, john@email.address)
- Upstream Issue (URL):
```

---

### Proposals

#### CNCF GOSST

##### CNCF and Google Open Source Security Team GSoC Collaboration - Enhancing Security Across CNCF Ecosystem

- Description: This project is a collaborative effort between the CNCF and Google's Open Source Security Team to improve security practices across various CNCF projects. The focus is identifying and addressing security vulnerabilities, integrating security tools like OSS-Fuzz, and enhancing build and release security processes. The goal is to get all CNCF projects to use scorecards (focusing on graduated/incubating projects first) and to remediate some of the findings.
- Expected Outcome:
  * All graduated and incubating CNCF projects using OpenSSF Scorecards to assess and enhance their security postures. Stretch goal: all (including sandbox) CNCF projects using OpenSFF Scorecards.
    * Remediation of identified vulnerabilities based on scorecard findings
    * Where CNCF projects are already using [OpenSSF Scorecard](https://securityscorecards.dev/), improved scores (remediating [various risk assessments](https://securityscorecards.dev/#the-checks)
  * Integration or enhancement of fuzzing with [OSS-Fuzz](https://google.github.io/oss-fuzz/) for CNCF projects
  * Improved build/release security by automating builds and releases, added build provenance, signing, and improved reproducibility
- Recommended Skills: Security analysis, CI/CD practices, programming (preferably Go), knowledge of CNCF projects.
- Expected project size: large (~350 hour projects)
- Mentor(s):
  - Nate Waddington (@nate-double-u, natew@cncf.io)
  - Dustin Ingram (dustiningram@google.com)
- Upstream Issue (URL): https://github.com/cncf/mentoring/issues/1196

#### Falco

##### Upgrading event-generator and automating Falco performance testing

- Description: Falco is a real-time security tool designed to detect abnormal behaviours and security-related runtime events in Linux systems and the cloud. The _event-generator_ is an utility within the Falco ecosystem that helps testing Falco’s detection capabilities. The tool also has benchmark capabilities that represent a building block of the Falco performance testing practices. However, the project received less attention than required in the past few years and would require some care and renovation. This Google Summer of Code project proposes upgrading the _event-generator_ to improve its testing and benchmarking capabilities, its reliability, and its consistency, and developing new Continuous Integration pipelines based on it. The end goal is to evolve the _event-generator_ and make it the standard tool for systematically assessing the correctness and performance of Falco’s threat detection capabilities at every release and development cycle
- Expected Outcome: The project will result in an extended version of the _event-generator_ tool that reliably generates a consistent number of events per second and stresses the most common detection scenarios of Falco. This enhanced utility will be integrated into Falco’s Continuous Integration (CI) pipeline, allowing for efficient systematic monitoring of performance regressions while ensuring alignment with past benchmarking results. Eventually, this could originate new performance optimizations in Falco itself. A stretch goal for the mentee would be to become an official maintainer of the _event-generator_ project and/or of other repositories of the Falco ecosystem
- Recommended Skills: Go programming language, familiarity with continuous integration, understanding of performance benchmarking concepts
- Expected project size: Large (350 hour project)
- Mentor(s):
  - Jason Dellaluce (@jasondellaluce, jasondellaluce@gmail.com) - primary
  - Aldo Lacuku (@alacuku, aldo@lacuku.eu)
- Upstream Issue (URL): https://github.com/falcosecurity/evolution/issues/362

#### in-toto

##### Sigstore support for in-toto-jenkins

- Description: The [in-toto Jenkins plugin](https://github.com/in-toto/in-toto-jenkins-plugin) allows users to generate metadata in their build pipelines. Currently keys or credentials must be provided to the plugin to sign the metadata, whereas Sigstore offers keyless signing and verification. The addition of Sigstore transport will allow seamless uploading of metadata to Rekor transparency log. This project aims to enhance the Jenkins plugin by adding [Sigstore](https://www.sigstore.dev) support, allowing keyless signing and adding Sigstore transport.
- Expected Outcome: in-toto-jenkins plugins gets support for Sigstore
- Recommended Skills: Java, Jenkins
- Expected project size: Medium (175 hour project)
- Mentor(s):
  - Santiago Torres-Arias (@SantiagoTorres, santiagotorres@purdue.edu) - primary
  - Pradyumna Krishna (@PradyumnaKrishna, git@onpy.in)
