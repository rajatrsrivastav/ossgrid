### Kyverno

##### Convert Kyverno Sample Policies to Use New CEL-Based Policy Types

- Description: Kyverno has introduced new CEL-based policy types in the `v1alpha1` API version that provide enhanced expressiveness, better performance, and native Kubernetes integration. These new policy types include ValidatingPolicy, MutatingPolicy, ImageValidatingPolicy, GeneratingPolicy, and DeletingPolicy. The goal of this project is to convert existing sample policies from the traditional Kyverno policy format to the new CEL-based format, ensuring they maintain the same functionality while leveraging the benefits of the new API.
- Expected Outcome:
  - Convert existing sample policies from traditional Kyverno format to new CEL-based policy types
  - Ensure functional equivalence between old and new policy formats
  - Write tests to validate the conversions and ensure reliability
  - Help users understand how to migrate from traditional policies to CEL-based format
- Recommended Skills:
  - Go programming language
  - Kubernetes API and admission controllers
  - CEL (Common Expression Language)
  - YAML/JSON configuration
  - Testing and documentation
- Mentors:
  - Mariam Fahmy (@MariamFahmy98, mariam.fahmy@nirmata.com)
  - Shuting Zhao (@realshuting, shuting@nirmata.com)
- Upstream Issue: https://github.com/kyverno/kyverno/issues/13709
- LFX URL: https://mentorship.lfx.linuxfoundation.org/project/ae18aaf2-374a-4657-8294-a0066b9a11bd

##### Support Namespaced CEL-Based Policies

- Description: Kyverno currently supports cluster-wide CEL-based policy types (ValidatingPolicy, MutatingPolicy, ImageValidatingPolicy, GeneratingPolicy, and DeletingPolicy), but lacks namespaced versions. This creates challenges for namespace owners who need to manage policies within their namespaces without requiring cluster-wide permissions. The goal of this project is to implement namespaced versions of all five CEL-based policy types to provide better RBAC control, security, and lifecycle management for namespace-scoped policy management.
- Expected Outcome:
  - Implement namespaced versions of all five CEL-based policy types:
  - Ensure proper RBAC integration for namespace-scoped policy management
  - Create comprehensive documentation and examples for namespaced policies
  - Write tests to validate namespaced policy functionality
- Recommended Skills:
  - Go programming language
  - Kubernetes API and admission controllers
  - CEL (Common Expression Language)
  - Kubernetes RBAC and security models
  - YAML/JSON configuration
  - Testing and documentation
- Mentors:
  - Charles-Edouard Brétéché (@eddycharly, charled.breteche@gmail.com)
  - Frank Jogeleit (@fjogeleit, frank.jogeleit@nirmata.com)
  - Yugandhar (@yrsuthari, ysuthari@gmail.com)
- Upstream Issue: https://github.com/kyverno/kyverno/issues/13185
- LFX URL: https://mentorship.lfx.linuxfoundation.org/project/6ad81eb7-295b-4ec8-b9b4-db20e1f3a346

#### Enhance Kyverno Documentation

- Description: Kyverno has evolved significantly with the introduction of new CEL-based policy types in the `v1alpha1` API version. The current documentation and website need to be updated to reflect these advancements and position Kyverno appropriately in the policy engine landscape. This project aims to enhance Kyverno's documentation, website content, and overall positioning to showcase the new capabilities while maintaining clear guidance for users transitioning from traditional policies to CEL-based formats.
- Expected Outcome:
  - Update and enhance Kyverno's website to reflect new CEL-based policy capabilities
  - Ensure comprehensive documentation for all new policy types
  - Update Kyverno's positioning in the policy engine ecosystem
  - Update comparison charts and feature matrices
  - Enhance user experience with better navigation and search functionality
  - Update API reference documentation with new policy types
- Recommended Skills
  - Technical writing and documentation
  - Kubernetes and policy engine knowledge
  - CEL (Common Expression Language) understanding
  - Markdown and documentation tools
- Mentors:
  -  Cortney Nickerson (@CortNick, cortney.nickerson@nirmata.com)
  - Luc Chmielowski (@lucchmielowski, luc.chmielowski@nirmata.com)
- Upstream Issue: https://github.com/kyverno/kyverno/issues/13710
- LFX URL: https://mentorship.lfx.linuxfoundation.org/project/6efc64ce-3fd5-4489-b4c0-846f661ecb6b

#### kube-burner

##### Enhancements around k8s performance testing

- Description:
  We intend to get some help around open issues in the repository and also come up with new use cases and scenarios for performance testing any kubernetes distribution. We love new perspectives and are always open to new ideas alongside what we have as tracked work in github issues.
- Expected Outcome:
  To knock down some of open critical issues and bring in new perspective to the project. There are no restrictions while working with issues/enhancements.
- Recommended Skills:
  - Golang
  - Kubernetes
  - Cloud Platforms
- Mentor(s):
  -  Vishnu Challa (@vishnuchalla, vchalla@redhat.com) 
  -  Raul Sevilla (@rsevilla87, rsevilla@redhat.com)
- Upstream Issues: (https://github.com/kube-burner/kube-burner/issues)
- LFX URL: https://mentorship.lfx.linuxfoundation.org/project/bafc9296-3069-432e-b1fc-600b7a6ad590

### kgateway
