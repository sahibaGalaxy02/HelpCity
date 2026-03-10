import { useState, useRef, useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Loader } from '@googlemaps/js-api-loader'
import { createIssue } from '../redux/slices/issuesSlice'
import { CATEGORIES, getCategoryIcon } from '../utils/helpers'
import { FiUpload, FiMapPin, FiX, FiNavigation, FiCamera } from 'react-icons/fi'

export default function ReportIssuePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
  })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [location, setLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  const initMap = useCallback(async (lat, lng) => {
    if (!mapRef.current) return
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places', 'geocoding'],
    })

    try {
      const { Map } = await loader.importLibrary('maps')
      const { AdvancedMarkerElement } = await loader.importLibrary('marker')

      const map = new Map(mapRef.current, {
        center: { lat, lng },
        zoom: 15,
        mapId: 'helpcity-map',
        disableDefaultUI: false,
        clickableIcons: false,
      })
      mapInstanceRef.current = map

      // Add marker
      const marker = new AdvancedMarkerElement({
        map,
        position: { lat, lng },
        title: 'Issue Location',
      })
      markerRef.current = marker

      // Click to move marker
      map.addListener('click', async (e) => {
        const newLat = e.latLng.lat()
        const newLng = e.latLng.lng()
        marker.position = { lat: newLat, lng: newLng }
        const address = await reverseGeocode(newLat, newLng, loader)
        setLocation({ lat: newLat, lng: newLng, address })
      })

      setMapLoaded(true)
    } catch (err) {
      console.error('Map init error:', err)
      // Map is optional - allow form submission without it
      setMapLoaded(true)
    }
  }, [])

  const reverseGeocode = async (lat, lng, loader) => {
    try {
      const { Geocoder } = await loader.importLibrary('geocoding')
      const geocoder = new Geocoder()
      const result = await geocoder.geocode({ location: { lat, lng } })
      return result.results[0]?.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
  }

  const detectLocation = () => {
    setLocationLoading(true)
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
        })
        const address = await reverseGeocode(lat, lng, loader)
        setLocation({ lat, lng, address })
        setLocationLoading(false)

        if (!mapInstanceRef.current) {
          await initMap(lat, lng)
        } else {
          mapInstanceRef.current.panTo({ lat, lng })
          if (markerRef.current) markerRef.current.position = { lat, lng }
        }
        toast.success('Location detected!')
      },
      (err) => {
        toast.error('Could not detect location. Please click on the map.')
        setLocationLoading(false)
        // Load map with default location (India)
        initMap(19.0760, 72.8777)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  useEffect(() => {
    // Load map on mount with default location
    initMap(19.0760, 72.8777)
  }, [initMap])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.category) {
      toast.error('Please select a category')
      return
    }
    if (!location) {
      toast.error('Please detect or select your location on the map')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('category', form.category)
      formData.append('location', JSON.stringify(location))
      if (image) formData.append('image', image)

      const res = await dispatch(createIssue(formData))
      if (createIssue.fulfilled.match(res)) {
        toast.success('Issue reported successfully! 🎉')
        navigate(`/issues/${res.payload._id}`)
      } else {
        toast.error(res.payload || 'Failed to submit issue')
      }
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-gray-900">Report a Civic Issue</h1>
        <p className="text-gray-500 text-sm mt-1">Help improve your city by reporting problems in your area</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-5">
            {/* Category */}
            <div className="card p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat }))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                      form.category === cat
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-100 hover:border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className="text-xl">{getCategoryIcon(cat)}</span>
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="card p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g., Deep pothole on MG Road near bus stop"
                className="input-field"
                minLength={5}
                maxLength={150}
                required
              />
              <p className="text-xs text-gray-400 mt-1">{form.title.length}/150</p>
            </div>

            {/* Description */}
            <div className="card p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the issue in detail. What's the problem? How severe is it?"
                className="input-field resize-none h-28"
                minLength={10}
                maxLength={1000}
                required
              />
              <p className="text-xs text-gray-400 mt-1">{form.description.length}/1000</p>
            </div>

            {/* Image upload */}
            <div className="card p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Photo <span className="text-gray-400 font-normal">(recommended)</span>
              </label>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(null) }}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-300 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('image-input').click()}
                >
                  <FiCamera className="mx-auto text-3xl text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Click or drag photo here</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB</p>
                </div>
              )}
              <input
                id="image-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Right column — Map */}
          <div className="space-y-5">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Location <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locationLoading}
                  className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {locationLoading ? (
                    <div className="w-3 h-3 border border-brand-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiNavigation size={12} />
                  )}
                  Detect My Location
                </button>
              </div>

              {/* Map */}
              <div ref={mapRef} className="map-container bg-gray-100 flex items-center justify-center">
                {!mapLoaded && (
                  <div className="text-center text-gray-400">
                    <FiMapPin className="mx-auto text-2xl mb-2" />
                    <p className="text-xs">Loading map...</p>
                  </div>
                )}
              </div>

              {location ? (
                <div className="mt-3 flex items-start gap-2 p-3 bg-brand-50 rounded-xl">
                  <FiMapPin className="text-brand-600 mt-0.5 flex-shrink-0" size={14} />
                  <div>
                    <p className="text-xs font-medium text-brand-700">{location.address}</p>
                    <p className="text-xs text-brand-500 mt-0.5 font-mono">
                      {location.lat?.toFixed(4)}, {location.lng?.toFixed(4)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-400 text-center">
                  Click "Detect Location" or click on the map to set location
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !form.title || !form.description || !form.category || !location}
              className="btn-primary w-full py-3 text-base"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="spinner" />
                  Submitting Report...
                </div>
              ) : (
                <><FiUpload size={16} /> Submit Report</>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Your report will be reviewed and forwarded to the concerned department
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
