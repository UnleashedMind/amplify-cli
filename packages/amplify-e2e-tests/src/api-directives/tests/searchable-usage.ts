//schema
export const schema = `
type Post @model @searchable {
  id: ID!
  title: String!
  createdAt: String!
  updatedAt: String!
  upvotes: Int
}`;
//mutations
export const mutation = `
mutation CreatePost {
  createPost(input: { title: "Stream me to Elasticsearch!" }) {
    id
    title
    createdAt
    updatedAt
    upvotes
  }
}`;

//queries
export const query1 = `
#error: add "s" for searchPosts
query SearchPosts {
  searchPosts(filter: { title: { match: "Stream" }}) {
    items {
      id
      title
    }
  }
}`;
