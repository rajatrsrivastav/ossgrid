# 2017

CNCF particpated as a mentoring organisation for [Google Summer of Code 2017](https://summerofcode.withgoogle.com/archive/2017/organizations/6018829461225472/).

The list of official project ideas for GSoC 2017 are listed below.

## Project Ideas

### Kubernetes

#### Improve ThirdPartyResources

* Description: ThirdPartyResources were added some time ago, but the implementation has languished with multiple outstanding capabilities that are missing. They did not complete the list of requirements for graduating to beta (kubernetes/kubernetes#22768).
* Recommended Skills: golang
* Mentor(s): Stefan Schimanski (@sttts)
* Issue: https://github.com/kubernetes/features/issues/95

#### Code metrics infrastructure, measure, report in CI

* Description: The Kubernetes code base grows every day. Reviews mostly concentrate on functionality and architecture, less on code hygiene like test coverage, cyclomatic complexity, linting etc. The goal of this project is to find better ways to support developers and reviewers by making these metrics more visible on new pull-requests. Ideas are to extend our github bots to post a green-yellow-red traffic light for certain measurements or to add new merge gates e.g. if test coverage goes down without being acknowledged by reviewers. 
* Recommended Skills: golang
* Mentor(s): Stefan Schimanski (@sttts)
* Issue:

#### Prototype ssh based replacement for kubctl-exec

* Description: Kubectl exec is implemented with a proprietary protocol. The communication is not end-to-end encrypted. This project is about prototyping the integration of an on-demand SSH server in the kubelet and tunneling of the connection through the apiserver.
* Recommended Skills: golang
* Mentor(s): Stefan Schimanski (@sttts)
* Issue: https://github.com/kubernetes/kubernetes/issues/42950

### gRPC


#### gRPC C Core:

* Port gRPC to  one of the major BSD platforms ([FreeBSD](https://freebsd.org), [NetBSD](https://netbsd.org), and [OpenBSD](https://openbsd.org)) and create packages for them. Add [kqueue](https://www.freebsd.org/cgi/man.cgi?query=kqueue) support in the process.
* Required skills: C programming language, BSD operating system.
* Likely Mentors: [Craig Tiller](https://github.com/ctiller),
 [Nicolas Noble](https://github.com/nicolasnoble),
 [Vijay Pai](https://github.com/vjpai).

* Fix gRPC C-core's URI parser. The current parser does not qualify as a standard parser according to [RFC3986]( https://tools.ietf.org/html/rfc3986). Write test suites to verify this and make changes necessary to make the URI parser compliant.
* Required skills: C programming language, HTTP standard compliance.
* Likely mentors: [Craig Tiller](https://github.com/ctiller).

* HPACK compression efficiency evaluation - Figure out how to benchmark gRPC's compression efficiency (both in terms of bytes on the wire and cpu cycles). Implement benchmarks. Potentially extend this to other full-stack gRPC implementations (Java and Go).
* Required skills: C programming language, software performance benchmarking, potentially Java and Go.
* Likely mentors: [Craig Tiller](https://github.com/ctiller).

