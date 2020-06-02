//schema
export const schema = `
type Post @model @auth(rules: [{allow: owner}]) {
  id: ID!
  title: String!
}

##generatesOwner`
//mutations
export const mutation1 = `
mutation CreatePost(
    $input: CreatePostInput!
    $condition: ModelPostConditionInput
  ) {
    createPost(input: $input, condition: $condition) {
      id
      title
      createdAt
      updatedAt
    }
}`
export const input_mutation1 = {
    "input": {
        "id": "1",
        "title": "title1"
    }
}
export const expected_result_mutation1 = {
    "data": {
        "createPost": {
            "id": "1",
            "title": "title1",
            "createdAt": "<check-defined>",
            "updatedAt": "<check-defined>"
        }
    }
}

export const mutation2 = `
 mutation UpdatePost(
    $input: UpdatePostInput!
    $condition: ModelPostConditionInput
  ) {
    updatePost(input: $input, condition: $condition) {
      id
      title
      createdAt
      updatedAt
    }
}`
export const input_mutation2 = {
    "input": {
        "id": "1",
        "title": "title1-updated"
    }
}
export const expected_result_mutation2 = {
    "data": {
        "updatePost": {
            "id": "1",
            "title": "title1-updated",
            "createdAt": "<check-defined>",
            "updatedAt": "<check-defined>"
        }
    }
}




