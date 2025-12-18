let blogs = []

export async function GET(request, { params }) {
  const blog = blogs.find(b => b.id == params.id)
  if (!blog) return new Response(null, { status: 404 })
  return Response.json(blog)
}

export async function PUT(request, { params }) {
  const data = await request.json()
  const index = blogs.findIndex(b => b.id == params.id)
  if (index !== -1) {
    blogs[index] = { ...blogs[index], ...data }
    return Response.json(blogs[index])
  }
  return new Response(null, { status: 404 })
}

export async function DELETE(request, { params }) {
  const index = blogs.findIndex(b => b.id == params.id)
  if (index !== -1) {
    blogs.splice(index, 1)
    return new Response(null, { status: 200 })
  }
  return new Response(null, { status: 404 })
}
