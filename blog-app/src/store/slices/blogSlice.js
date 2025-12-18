import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = ''  // ← Empty string (was 'http://localhost:3001')

export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async () => {
    const response = await axios.get(`${API_URL}/blogs`)
    return response.data
  }
)

export const createBlog = createAsyncThunk(
  'blogs/createBlog',
  async (blogData) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const response = await axios.post(`${API_URL}/blogs`, {
      ...blogData,
      ownerId: user.id || Date.now(),  // Current user owns it
      ownerEmail: user.email || 'anonymous'
    })
    return response.data
  }
)

// ✅ ADD THIS MISSING updateBlog
export const updateBlog = createAsyncThunk(
  'blogs/updateBlog',
  async ({ id, ...blogData }) => {
    const response = await axios.put(`${API_URL}/blogs/${id}`, blogData)
    return response.data
  }
)

export const deleteBlog = createAsyncThunk(
  'blogs/deleteBlog',
  async (id) => {
    await axios.delete(`${API_URL}/blogs/${id}`)
    return id
  }
)

const blogSlice = createSlice({
  name: 'blogs',
  initialState: { blogs: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {

    builder
      .addCase(fetchBlogs.pending, (state) => { state.loading = true })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false
        state.blogs = action.payload
      })
      
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.blogs.push(action.payload)
      })
      // ✅ ADD THIS MISSING updateBlog case
      .addCase(updateBlog.fulfilled, (state, action) => {
        const index = state.blogs.findIndex(blog => blog.id === action.payload.id)
        if (index !== -1) {
          state.blogs[index] = action.payload
        }
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter(blog => blog.id !== action.payload)
      })
  },
})

export default blogSlice.reducer
