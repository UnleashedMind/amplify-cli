//schema
export const schema = `
# private authorization with provider override
#error: InvalidDirectiveError: @auth directive with 'private' strategy only supports 'userPools' (default) and 'iam' providers,
#but found 'oidc' assigned.
type Post @model @auth(rules: [{ allow: private, provider: oidc }]) {
  id: ID!
  title: String!
}

# owner authorization with provider override
type Profile @model @auth(rules: [{ allow: owner, provider: oidc, identityClaim: "sub" }]) {
  id: ID!
  displayNAme: String!
}

##authUsingOidc
`



