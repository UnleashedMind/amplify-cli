//schema
const env = "${env}";
export const schema = `
#change: inserted "<function-name>" placeholder, the test will replace it with the actual function name
type Query {
  echo(msg: String): String @function(name: "<function-name>-${env}")
}
`

//queries
export const query = `
#extra
query Echo {
  echo(msg: "query message")
}
`
export const expected_result_query = {
    "data": {
        "echo": "query message"
    }
}



