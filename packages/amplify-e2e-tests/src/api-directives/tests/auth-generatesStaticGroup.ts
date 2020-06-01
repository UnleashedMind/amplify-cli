//schema
export const schema = `
#change: changed "Admin" to "admin"
#error: though harmless, groups is probably unintentionally put here, and it's misleading, for static group auth, it does not need such field.
type Post @model @auth(rules: [{ allow: groups, groups: ["admin"] }]) {
  id: ID!
  title: String!
  groups: String
}

##generatesStaticGroup
`
//mutations
export const mutation1 = `
mutation CreatePost($input: CreatePostInput!, $condition: ModelPostConditionInput) {
  createPost(input: $input, condition: $condition) {
    id
    title
    groups
    createdAt
    updatedAt
  }
}
`
export const input_mutation1 = {
    "input": {
        "id": "1",
        "title": "title1",
        "groups": "admin"
    }
}
export const expected_result_mutation1 = {
    "data": {
        "createPost": {
            "id": "1",
            "title": "title1",
            "groups": "admin",
            "createdAt": "<check-defined>",
            "updatedAt": "<check-defined>"
        }
    }
}

export const mutation2 = `
mutation UpdatePost($input: UpdatePostInput!, $condition: ModelPostConditionInput) {
  updatePost(input: $input, condition: $condition) {
    id
    title
    groups
    createdAt
    updatedAt
  }
}
`
export const input_mutation2 = {
    "input": {
        "id": "1",
        "title": "title1-updated",
        "groups": "admin"
    }
}
export const expected_result_mutation2 = {
    "data": {
        "updatePost": {
            "id": "1",
            "title": "title1-updated",
            "groups": "admin",
            "createdAt": "<check-defined>",
            "updatedAt": "<check-defined>"
        }
    }
}




