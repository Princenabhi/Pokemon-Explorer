import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, X, LoaderCircle, Sparkles, ChevronDown } from 'lucide-react'

const PAGE_SIZE = 20

const titleCase = (value = '') => value.charAt(0).toUpperCase() + value.slice(1)

function PokemonCard({ pokemon, onSelect }) {
  const id = String(pokemon.id).padStart(3, '0')
  return (
    <button className="pokemon-card" onClick={() => onSelect(pokemon)} aria-label={`View ${pokemon.name} details`}>
      <span className="pokemon-number">#{id}</span>
      <img
        src={pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default}
        alt={pokemon.name}
        loading="lazy"
      />
      <h2>{titleCase(pokemon.name)}</h2>
      <div className="type-row">
        {pokemon.types?.map(({ type }) => (
          <span className={`type-pill ${type.name}`} key={type.name}>{type.name}</span>
        ))}
      </div>
      <span className="view-details">View details <span aria-hidden="true">↗</span></span>
    </button>
  )
}

function PokemonDetails({ pokemon, onClose }) {
  if (!pokemon) return null
  const image = pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="details-modal" role="dialog" aria-modal="true" aria-label={`${pokemon.name} details`}>
        <button className="close-button" onClick={onClose} aria-label="Close details"><X size={20} /></button>
        <div className="details-art">
          <span className="details-number">#{String(pokemon.id).padStart(3, '0')}</span>
          <img src={image} alt={pokemon.name} />
        </div>
        <div className="details-content">
          <p className="eyebrow">Pokémon details</p>
          <h2>{titleCase(pokemon.name)}</h2>
          <div className="type-row">
            {pokemon.types.map(({ type }) => <span className={`type-pill ${type.name}`} key={type.name}>{type.name}</span>)}
          </div>
          <div className="stats-grid">
            <div><span>Height</span><strong>{pokemon.height / 10} m</strong></div>
            <div><span>Weight</span><strong>{pokemon.weight / 10} kg</strong></div>
            <div><span>Base experience</span><strong>{pokemon.base_experience ?? '—'}</strong></div>
            <div><span>Abilities</span><strong>{pokemon.abilities.map(({ ability }) => titleCase(ability.name)).join(', ')}</strong></div>
          </div>
          <h3>Base stats</h3>
          <div className="stats-list">
            {pokemon.stats.map(({ stat, base_stat }) => (
              <div className="stat-row" key={stat.name}>
                <span>{titleCase(stat.name.replace('-', ' '))}</span>
                <div className="stat-track"><i style={{ width: `${Math.min(base_stat / 160 * 100, 100)}%` }} /></div>
                <b>{base_stat}</b>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default function App() {
  const [pokemon, setPokemon] = useState([])
  const [nextUrl, setNextUrl] = useState('https://pokeapi.co/api/v2/pokemon?limit=20&offset=0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [search, setSearch] = useState('')
  const observerTarget = useRef(null)
  const loadingRef = useRef(false)

  const loadPokemon = useCallback(async () => {
    if (!nextUrl || loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError('')
    try {
      const response = await fetch(nextUrl)
      if (!response.ok) throw new Error('Could not load Pokémon. Please try again.')
      const data = await response.json()
      const details = await Promise.all(data.results.map(async (item) => {
        const result = await fetch(item.url)
        if (!result.ok) throw new Error('Could not load Pokémon details.')
        return result.json()
      }))
      setPokemon((current) => [...current, ...details])
      setNextUrl(data.next)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [nextUrl])

  useEffect(() => { loadPokemon() }, []) // Load the first 20 Pokémon.

  useEffect(() => {
    const node = observerTarget.current
    if (!node) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingRef.current && nextUrl) loadPokemon()
    }, { rootMargin: '300px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [loadPokemon, nextUrl])

  const openDetails = async (item) => {
    setSelected(item)
    setDetailLoading(true)
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${item.id}`)
      if (!response.ok) throw new Error('Unable to load details.')
      setSelected(await response.json())
    } catch {
      // The list item still contains enough information to keep the dialog usable.
    } finally {
      setDetailLoading(false)
    }
  }

  const filteredPokemon = pokemon.filter((item) => item.name.includes(search.trim().toLowerCase()))

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="topline"><span className="brand-mark">P</span><span>POKÉDEX / EXPLORER</span></div>
        <div className="hero-copy">
          <p className="eyebrow"><Sparkles size={15} /> DISCOVER THE WORLD OF POKÉMON</p>
          <h1>Gotta catch<br /><span>them all.</span></h1>
          <p className="hero-description">Explore Pokémon, learn about their abilities, and discover your next favorite.</p>
          <label className="search-box">
            <Search size={20} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Pokémon by name..." />
            {search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={17} /></button>}
          </label>
        </div>
        <div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
        <div className="pokeball-decoration"><span /></div>
      </header>

      <section className="catalog">
        <div className="section-heading">
          <div><p className="eyebrow">YOUR COLLECTION</p><h2>Pokémon <span>directory</span></h2></div>
          <p className="count-label">{pokemon.length} discovered</p>
        </div>

        {error && <div className="error-message">{error} <button onClick={loadPokemon}>Retry</button></div>}
        <div className="pokemon-grid">
          {filteredPokemon.map((item) => <PokemonCard key={item.id} pokemon={item} onSelect={openDetails} />)}
        </div>
        {search && filteredPokemon.length === 0 && !loading && <p className="empty-state">No Pokémon found in the loaded collection. Clear search or load more Pokémon.</p>}
        <div className="load-area" ref={observerTarget}>
          {loading ? <><LoaderCircle className="spinner" size={22} /> <span>Loading Pokémon...</span></> :
            nextUrl ? <><ChevronDown size={18} /> <span>Scroll to discover more</span></> : <span>You've reached the end!</span>}
        </div>
      </section>

      {detailLoading && selected && <div className="detail-loading"><LoaderCircle className="spinner" /> Loading details...</div>}
      <PokemonDetails pokemon={selected} onClose={() => setSelected(null)} />
      <footer>Made with curiosity and the PokéAPI <span>·</span> Data from pokeapi.co</footer>
    </main>
  )
}