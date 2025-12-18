let blogs = []

export async function GET() {
  return Response.json(blogs)
}

export async function POST(request) {
  const blog = await request.json()
  blog.id = Date.now()
  blogs.push(blog)
  return Response.json(blog, { status: 201 })
}
