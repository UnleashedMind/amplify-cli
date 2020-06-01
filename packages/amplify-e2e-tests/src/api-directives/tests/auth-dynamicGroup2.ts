//schema
export const schema = `
type Post @model @auth(rules: [{ allow: groups, groupsField: "group" }]) {
  id: ID!
  title: String
  group: String
}

##dynamicGroup2
`
//mutations
export const mutation1 = `
mutation CreatePost($input: CreatePostInput!, $condition: ModelPostConditionInput) {
  createPost(input: $input, condition: $condition) {
    id
    title
    group
    createdAt
    updatedAt
  }
}
`
export const input_mutation1 = {
    "input": {
        "id": "1",
        "title": "title1",
        "group": "admin"
    }
}
export const expected_result_mutation1 = {
    "data": {
        "createPost": {
            "id": "1",
            "title": "title1",
            "group": "admin",
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
    group
    createdAt
    updatedAt
  }
}
`
export const input_mutation2 = {
    "input": {
        "id": "1",
        "title": "title1-updated",
        "group": "admin"
    }
}
export const expected_result_mutation2 = {
    "data": {
        "updatePost": {
            "id": "1",
            "title": "title1-updated",
            "group": "admin",
            "createdAt": "<check-defined>",
            "updatedAt": "<check-defined>"
        }
    }
}




