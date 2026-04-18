import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    useSearchParams,
} from 'react-router-dom'

const Home = () => (
    <div>
        <h1>Home</h1>
        <p>Welcome</p>
        <button>Placeholder</button>
        <br />
        <a href="/handbuch.pdf">Download PDF</a>
        <br />
        <a href="/image.png">View Image</a>
        <br />
        <img src="/image.png" alt="this is a placeholder" />
        <br />
        <img src="/image.png" alt="image123" />
        <br />
        <img src="/image.png" alt="background.jpg" />
    </div>
)

const About = () => (
    <div>
        <h1>About us</h1>
        <Link to="secret">Go to Secret Page</Link>
        <br />
        <button aria-label=""></button>
        <br />
        <button aria-label=""></button>
    </div>
)

const Contact = () => (
    <div>
        <h1>Contact</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a href="mailto:support@example.com">E-Mail</a>
            <a href="tel:+49123456789">Call us</a>
            <a href="javascript:void(0)" onClick={() => alert('JS-Link!')}>
                Click me
            </a>
        </div>
        <br />
        <a href="#form-anchor">Go to Form</a>
        <div style={{ marginTop: '100vh' }} id="form-anchor">
            <h3>Form</h3>
            <button>Submit</button>
        </div>
    </div>
)

const Secret = () => (
    <div>
        <h1>Secret Page</h1>
        <p>This page was found through the "About Us" section!</p>
        <Link to="/about/secret/deep">Go even deeper ...</Link>
    </div>
)

const DeepSecret = () => (
    <div>
        <h1>Very Deep Page</h1>
        <p>Congratulations, you have reached the end of the path.</p>
        <Link to="/">Back to the Beginning</Link>
        <br />
        <button>Placeholder</button>
    </div>
)

const Shop = () => {
    const [searchParams] = useSearchParams()
    const currentPage = parseInt(searchParams.get('page') || '1', 10)
    const totalPages = 5

    return (
        <div>
            <h1>Shop Overview (Page {currentPage})</h1>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginBottom: '20px',
                }}
            >
                <Link to={`/shop/product?id=${(currentPage - 1) * 2 + 1}`}>
                    Product A (Page {currentPage})
                </Link>
                <Link to={`/shop/product?id=${(currentPage - 1) * 2 + 2}`}>
                    Product B (Page {currentPage})
                </Link>
            </div>
            <div
                style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    marginTop: '20px',
                }}
            >
                <span>Pages:</span>
                {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1
                    return (
                        <Link
                            key={pageNum}
                            to={`/shop?page=${pageNum}`}
                            style={{
                                padding: '5px 10px',
                                background:
                                    currentPage === pageNum
                                        ? '#007bff'
                                        : '#fff',
                                color:
                                    currentPage === pageNum
                                        ? '#fff'
                                        : '#007bff',
                                border: '1px solid #007bff',
                                textDecoration: 'none',
                                borderRadius: '4px',
                            }}
                        >
                            {pageNum}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

const ProductDetail = () => {
    return (
        <div>
            <h1>Product Detail Page</h1>
            <Link to="/shop">Back to Shop</Link>
            <br />
            <button>Placeholder</button>
        </div>
    )
}

function App() {
    return (
        <BrowserRouter>
            <nav
                style={{
                    padding: '20px',
                    background: '#eee',
                    display: 'flex',
                    gap: '15px',
                }}
            >
                <Link to="/">Home</Link>
                <Link to="/four-oh-four">404</Link>
                <Link to="/about/">About us</Link>
                <Link to="/contact#form-anchor">Contact</Link>
                <Link to="/shop">Shop</Link>
                <a href="https://google.com" target="_blank" rel="noreferrer">
                    External
                </a>
            </nav>

            <main style={{ padding: '20px' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/about/secret" element={<Secret />} />
                    <Route path="/about/secret/deep" element={<DeepSecret />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/shop/product" element={<ProductDetail />} />
                </Routes>
            </main>
        </BrowserRouter>
    )
}

export default App
