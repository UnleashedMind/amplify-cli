//schema
export const schema = `
#error: two @model on type Post
#change: removed on @model

type Post
  @model
  @auth(rules: [{ allow: owner, identityClaim: "user_id" }, { allow: groups, groups: ["Moderator"], groupClaim: "user_groups" }]) {
  id: ID!
  owner: String
  postname: String
  content: String
}

##customClaims
`



