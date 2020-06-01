//schema
const env = "${env}";
export const schema = `
#change: replaced "GraphQLResolverFunction" with the "<function-name>" placeholder, the test will replace it with the actual function name
type Query {
  posts: [Post] @function(name: "<function-name>-${env}")
}
type Post {
  id: ID!
  title: String!
  comments: [Comment] @function(name: "<function-name>-${env}")
}
type Comment {
  postId: ID!
  content: String
}
`

//queries
export const query = `
#extra
query Posts {
  posts {
    id
    title
    comments {
      postId
      content
    }
  }
}
`
export const expected_result_query = {
    "data": {
        "posts": [
            {
                "id": "1",
                "title": "AWS Lambda: How To Guide.",
                "comments": [
                    {
                        "postId": "1",
                        "content": "Great guide!"
                    },
                    {
                        "postId": "1",
                        "content": "Thanks for sharing!"
                    }
                ]
            },
            {
                "id": "2",
                "title": "AWS Amplify Launches @function and @key directives.",
                "comments": [
                    {
                        "postId": "2",
                        "content": "Can't wait to try them out!"
                    }
                ]
            },
            {
                "id": "3",
                "title": "Serverless 101",
                "comments": []
            }
        ]
    }
}



