export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  
  let users = [
    { id: 1, name: "Admin User", email: "admin@example.com", password: "password123" }
  ]
  
  if (email) {
    users = users.filter(u => u.email === email)
  }
  
  return Response.json(users)
}

export async function POST(request) {
  const newUser = await request.json()
  newUser.id = Date.now()
  return Response.json(newUser, { status: 201 })
}
