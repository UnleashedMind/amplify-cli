//schema
export const schema = `
#error: need to add "create" in the editors' operations in order for the mutation 4 to succeed
type Draft
  @model
  @auth(
    rules: [
      # Defaults to use the "owner" field.
      { allow: owner }
      # Authorize the update mutation and both queries. Use "queries: null" to disable auth for queries.
      { allow: owner, ownerField: "editors", operations: [create, update, read] }
    ]
  ) {
  id: ID!
  title: String!
  content: String
  owner: String
  editors: [String]
}

##auth/multiAuthRules
`
//mutations
export const mutation1 = `
#change: removed id from the response so result can be verified
#1
mutation CreateDraft {
  createDraft(input: { title: "A new draft" }) {
    title
    owner
    editors
  }
}
`
export const expected_result_mutation1 = {
    "data": {
        "createDraft": {
            "title": "A new draft",
            "owner": "user1",
            "editors": [
                "user1"
            ]
        }
    }
}

export const mutation2 = `
#change: removed id from the response so result can be verified
#2
mutation CreateDraft {
  createDraft(input: { title: "A new draft", editors: [] }) {
    title
    owner
    editors
  }
}
`
export const expected_result_mutation2 = {
    "data": {
        "createDraft": {
            "title": "A new draft",
            "owner": "user1",
            "editors": []
        }
    }
}

export const mutation3 = `
#change: removed id from the response so result can be verified
#3
mutation CreateDraft {
  createDraft(input: { title: "A new draft", editors: [], owner: null }) {
    title
    owner
    editors
  }
}
`
export const expected_result_mutation3 = {
    "graphQLErrors": [
        {
            "errorType": "Unauthorized"
        }
    ]
}

export const mutation4 = `
#change: removed id from the response so result can be verified
#4
mutation CreateDraft {
  createDraft(input: { title: "A new draft", editors: ["user1"], owner: null }) {
    title
    owner
    editors
  }
}
`
export const expected_result_mutation4 = {
    "data": {
        "createDraft": {
            "title": "A new draft",
            "owner": null,
            "editors": [
                "user1"
            ]
        }
    }
}


//queries
export const query = `
#extra
query ListDrafts {
  listDrafts(filter: null, limit: null, nextToken: null) {
    items {
      id
      title
      content
      owner
      editors
    }
    nextToken
  }
}
`



