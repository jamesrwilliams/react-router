import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import type { RelativeRoutingType, To } from "react-router";
import {
  MemoryRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
  createMemoryRouter,
  createRoutesFromElements,
  Outlet,
  RouterProvider,
} from "react-router";

describe("useNavigate", () => {
  it("navigates to the new location", () => {
    function Home() {
      let navigate = useNavigate();

      function handleClick() {
        navigate("/about");
      }

      return (
        <div>
          <h1>Home</h1>
          <button onClick={handleClick}>click me</button>
        </div>
      );
    }

    let renderer: TestRenderer.ReactTestRenderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter initialEntries={["/home"]}>
          <Routes>
            <Route path="home" element={<Home />} />
            <Route path="about" element={<h1>About</h1>} />
          </Routes>
        </MemoryRouter>
      );
    });

    // @ts-expect-error
    let button = renderer.root.findByType("button");
    TestRenderer.act(() => button.props.onClick());

    // @ts-expect-error
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      <h1>
        About
      </h1>
    `);
  });

  it("navigates to the new location when no pathname is provided", () => {
    function Home() {
      let location = useLocation();
      let navigate = useNavigate();

      return (
        <>
          <p>{location.pathname + location.search}</p>
          <button onClick={() => navigate("?key=value")}>click me</button>
        </>
      );
    }

    let renderer: TestRenderer.ReactTestRenderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter initialEntries={["/home"]}>
          <Routes>
            <Route path="home" element={<Home />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // @ts-expect-error
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      [
        <p>
          /home
        </p>,
        <button
          onClick={[Function]}
        >
          click me
        </button>,
      ]
    `);

    // @ts-expect-error
    let button = renderer.root.findByType("button");
    TestRenderer.act(() => button.props.onClick());

    // @ts-expect-error
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      [
        <p>
          /home?key=value
        </p>,
        <button
          onClick={[Function]}
        >
          click me
        </button>,
      ]
    `);
  });

  it("navigates to the new location when no pathname is provided (with a basename)", () => {
    function Home() {
      let location = useLocation();
      let navigate = useNavigate();

      return (
        <>
          <p>{location.pathname + location.search}</p>
          <button onClick={() => navigate("?key=value")}>click me</button>
        </>
      );
    }

    let renderer: TestRenderer.ReactTestRenderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter basename="/basename" initialEntries={["/basename/home"]}>
          <Routes>
            <Route path="home" element={<Home />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // @ts-expect-error
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      [
        <p>
          /home
        </p>,
        <button
          onClick={[Function]}
        >
          click me
        </button>,
      ]
    `);

    // @ts-expect-error
    let button = renderer.root.findByType("button");
    TestRenderer.act(() => button.props.onClick());

    // @ts-expect-error
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      [
        <p>
          /home?key=value
        </p>,
        <button
          onClick={[Function]}
        >
          click me
        </button>,
      ]
    `);
  });

  it("navigates to the new location with empty query string when no query string is provided", () => {
    function Home() {
      let location = useLocation();
      let navigate = useNavigate();

      return (
        <>
          <p>{location.pathname + location.search}</p>
          <button onClick={() => navigate("/home")}>click me</button>
        </>
      );
    }

    let renderer: TestRenderer.ReactTestRenderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter initialEntries={["/home?key=value"]}>
          <Routes>
            <Route path="home" element={<Home />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // @ts-expect-error
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      [
        <p>
          /home?key=value
        </p>,
        <button
          onClick={[Function]}
        >
          click me
        </button>,
      ]
    `);

    // @ts-expect-error
    let button = renderer.root.findByType("button");
    TestRenderer.act(() => button.props.onClick());

    // @ts-expect-error
    expect(renderer.toJSON()).toMatchInlineSnapshot(`
      [
        <p>
          /home
        </p>,
        <button
          onClick={[Function]}
        >
          click me
        </button>,
      ]
    `);
  });

  it("throws on invalid destination path objects", () => {
    function Home() {
      let navigate = useNavigate();

      return (
        <div>
          <h1>Home</h1>
          <button onClick={() => navigate({ pathname: "/about/thing?search" })}>
            click 1
          </button>
          <button onClick={() => navigate({ pathname: "/about/thing#hash" })}>
            click 2
          </button>
          <button
            onClick={() => navigate({ pathname: "/about/thing?search#hash" })}
          >
            click 3
          </button>
          <button
            onClick={() =>
              navigate({
                pathname: "/about/thing",
                search: "?search#hash",
              })
            }
          >
            click 4
          </button>
        </div>
      );
    }

    let renderer: TestRenderer.ReactTestRenderer;
    TestRenderer.act(() => {
      renderer = TestRenderer.create(
        <MemoryRouter initialEntries={["/home"]}>
          <Routes>
            <Route path="home" element={<Home />} />
          </Routes>
        </MemoryRouter>
      );
    });

    expect(() =>
      TestRenderer.act(() => {
        renderer.root.findAllByType("button")[0].props.onClick();
      })
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot include a '?' character in a manually specified \`to.pathname\` field [{"pathname":"/about/thing?search"}].  Please separate it out to the \`to.search\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you."`
    );

    expect(() =>
      TestRenderer.act(() => {
        renderer.root.findAllByType("button")[1].props.onClick();
      })
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot include a '#' character in a manually specified \`to.pathname\` field [{"pathname":"/about/thing#hash"}].  Please separate it out to the \`to.hash\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you."`
    );

    expect(() =>
      TestRenderer.act(() => {
        renderer.root.findAllByType("button")[2].props.onClick();
      })
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot include a '?' character in a manually specified \`to.pathname\` field [{"pathname":"/about/thing?search#hash"}].  Please separate it out to the \`to.search\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you."`
    );

    expect(() =>
      TestRenderer.act(() => {
        renderer.root.findAllByType("button")[3].props.onClick();
      })
    ).toThrowErrorMatchingInlineSnapshot(
      `"Cannot include a '#' character in a manually specified \`to.search\` field [{"pathname":"/about/thing","search":"?search#hash"}].  Please separate it out to the \`to.hash\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you."`
    );
  });

  describe("with state", () => {
    it("adds the state to location.state", () => {
      function Home() {
        let navigate = useNavigate();

        function handleClick() {
          navigate("/about", { state: { from: "home" } });
        }

        return (
          <div>
            <h1>Home</h1>
            <button onClick={handleClick}>click me</button>
          </div>
        );
      }

      function ShowLocationState() {
        return <p>location.state:{JSON.stringify(useLocation().state)}</p>;
      }

      let renderer: TestRenderer.ReactTestRenderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={["/home"]}>
            <Routes>
              <Route path="home" element={<Home />} />
              <Route path="about" element={<ShowLocationState />} />
            </Routes>
          </MemoryRouter>
        );
      });

      // @ts-expect-error
      let button = renderer.root.findByType("button");
      TestRenderer.act(() => button.props.onClick());

      // @ts-expect-error
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        <p>
          location.state:
          {"from":"home"}
        </p>
      `);
    });
  });

  describe("when relative navigation is handled via React Context", () => {
    describe("with an absolute href", () => {
      it("navigates to the correct URL", () => {
        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={["/home"]}>
              <Routes>
                <Route
                  path="home"
                  element={<UseNavigateButton to="/about" />}
                />
                <Route path="about" element={<h1>About</h1>} />
              </Routes>
            </MemoryRouter>
          );
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            About
          </h1>
        `);
      });
    });

    describe("with a relative href (relative=route)", () => {
      it("navigates to the correct URL", () => {
        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={["/home"]}>
              <Routes>
                <Route
                  path="home"
                  element={<UseNavigateButton to="../about" />}
                />
                <Route path="about" element={<h1>About</h1>} />
              </Routes>
            </MemoryRouter>
          );
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            About
          </h1>
        `);
      });

      it("handles upward navigation from an index routes", () => {
        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={["/home"]}>
              <Routes>
                <Route path="home">
                  <Route index element={<UseNavigateButton to="../about" />} />
                </Route>
                <Route path="about" element={<h1>About</h1>} />
              </Routes>
            </MemoryRouter>
          );
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            About
          </h1>
        `);
      });

      it("handles upward navigation from inside a pathless layout route", () => {
        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={["/home"]}>
              <Routes>
                <Route element={<Outlet />}>
                  <Route
                    path="home"
                    element={<UseNavigateButton to="../about" />}
                  />
                </Route>
                <Route path="about" element={<h1>About</h1>} />
              </Routes>
            </MemoryRouter>
          );
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            About
          </h1>
        `);
      });

      it("handles upward navigation from inside multiple pathless layout routes + index route", () => {
        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={["/home"]}>
              <Routes>
                <Route path="home">
                  <Route element={<Outlet />}>
                    <Route element={<Outlet />}>
                      <Route element={<Outlet />}>
                        <Route
                          index
                          element={<UseNavigateButton to="../about" />}
                        />
                      </Route>
                    </Route>
                  </Route>
                </Route>
                <Route path="about" element={<h1>About</h1>} />
              </Routes>
            </MemoryRouter>
          );
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            About
          </h1>
        `);
      });

      it("handles upward navigation from inside multiple pathless layout routes + path route", () => {
        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={["/home/page"]}>
              <Routes>
                <Route path="home" element={<Outlet />}>
                  <Route element={<Outlet />}>
                    <Route element={<Outlet />}>
                      <Route element={<Outlet />}>
                        <Route
                          path="page"
                          element={<UseNavigateButton to="../../about" />}
                        />
                      </Route>
                    </Route>
                  </Route>
                </Route>
                <Route path="about" element={<h1>About</h1>} />
              </Routes>
            </MemoryRouter>
          );
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            About
          </h1>
        `);
      });

      it("handles parent navigation from inside multiple pathless layout routes", () => {
        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={["/home/page"]}>
              <Routes>
                <Route
                  path="home"
                  element={
                    <>
                      <h1>Home</h1>
                      <Outlet />
                    </>
                  }
                >
                  <Route element={<Outlet />}>
                    <Route element={<Outlet />}>
                      <Route element={<Outlet />}>
                        <Route
                          path="page"
                          element={
                            <>
                              <h2>Page</h2>
                              <UseNavigateButton to=".." />
                            </>
                          }
                        />
                      </Route>
                    </Route>
                  </Route>
                </Route>
                <Route path="about" element={<h1>About</h1>} />
              </Routes>
            </MemoryRouter>
          );
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Home
          </h1>
        `);
      });

      it("handles relative navigation from nested index route", () => {
        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={["/layout/thing"]}>
              <Routes>
                <Route path="layout">
                  <Route path=":param">
                    {/* redirect /layout/:param/ index routes to /layout/:param/dest */}
                    <Route index element={<UseNavigateButton to="dest" />} />
                    <Route path="dest" element={<h1>Destination</h1>} />
                  </Route>
                </Route>
              </Routes>
            </MemoryRouter>
          );
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Destination
          </h1>
        `);
      });
    });

    describe("with a relative href (relative=path)", () => {
      it("navigates to the correct URL", () => {
        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={["/contacts/1"]}>
              <Routes>
                <Route path="contacts" element={<h1>Contacts</h1>} />
                <Route
                  path="contacts/:id"
                  element={<UseNavigateButton to=".." relative="path" />}
                />
              </Routes>
            </MemoryRouter>
          );
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Contacts
          </h1>
        `);
      });

      it("handles upward navigation from an index routes", () => {
        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={["/contacts/1"]}>
              <Routes>
                <Route path="contacts" element={<h1>Contacts</h1>} />
                <Route path="contacts/:id">
                  <Route
                    index
                    element={<UseNavigateButton to=".." relative="path" />}
                  />
                </Route>
              </Routes>
            </MemoryRouter>
          );
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Contacts
          </h1>
        `);
      });

      it("handles upward navigation from inside a pathless layout route", () => {
        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={["/contacts/1"]}>
              <Routes>
                <Route path="contacts" element={<h1>Contacts</h1>} />
                <Route element={<Outlet />}>
                  <Route
                    path="contacts/:id"
                    element={<UseNavigateButton to=".." relative="path" />}
                  />
                </Route>
              </Routes>
            </MemoryRouter>
          );
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Contacts
          </h1>
        `);
      });

      it("handles upward navigation from inside multiple pathless layout routes + index route", () => {
        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={["/contacts/1"]}>
              <Routes>
                <Route path="contacts" element={<h1>Contacts</h1>} />
                <Route path="contacts/:id">
                  <Route element={<Outlet />}>
                    <Route element={<Outlet />}>
                      <Route element={<Outlet />}>
                        <Route
                          index
                          element={
                            <UseNavigateButton to=".." relative="path" />
                          }
                        />
                      </Route>
                    </Route>
                  </Route>
                </Route>
              </Routes>
            </MemoryRouter>
          );
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Contacts
          </h1>
        `);
      });

      it("handles upward navigation from inside multiple pathless layout routes + path route", () => {
        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={["/contacts/1"]}>
              <Routes>
                <Route path="contacts" element={<Outlet />}>
                  <Route index element={<h1>Contacts</h1>} />
                  <Route element={<Outlet />}>
                    <Route element={<Outlet />}>
                      <Route element={<Outlet />}>
                        <Route
                          path=":id"
                          element={
                            <UseNavigateButton to=".." relative="path" />
                          }
                        />
                      </Route>
                    </Route>
                  </Route>
                </Route>
              </Routes>
            </MemoryRouter>
          );
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Contacts
          </h1>
        `);
      });

      it("handles relative navigation from nested index route", () => {
        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={["/layout/thing"]}>
              <Routes>
                <Route path="layout">
                  <Route path=":param">
                    {/* redirect /layout/:param/ index routes to /layout/:param/dest */}
                    <Route
                      index
                      element={<UseNavigateButton to="dest" relative="path" />}
                    />
                    <Route path="dest" element={<h1>Destination</h1>} />
                  </Route>
                </Route>
              </Routes>
            </MemoryRouter>
          );
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Destination
          </h1>
        `);
      });

      it("preserves search params and hash", () => {
        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(
            <MemoryRouter initialEntries={["/contacts/1"]}>
              <Routes>
                <Route path="contacts" element={<Contacts />} />
                <Route
                  path="contacts/:id"
                  element={
                    <UseNavigateButton to="..?foo=bar#hash" relative="path" />
                  }
                />
              </Routes>
            </MemoryRouter>
          );
        });

        function Contacts() {
          let { search, hash } = useLocation();
          return (
            <>
              <h1>Contacts</h1>
              <p>
                {search}
                {hash}
              </p>
            </>
          );
        }

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          [
            <h1>
              Contacts
            </h1>,
            <p>
              ?foo=bar
              #hash
            </p>,
          ]
        `);
      });
    });

    it("is not stable across location changes", () => {
      let renderer: TestRenderer.ReactTestRenderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <MemoryRouter initialEntries={["/home"]}>
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <NavBar />
                    <Outlet />
                  </>
                }
              >
                <Route path="home" element={<h1>Home</h1>} />
                <Route path="about" element={<h1>About</h1>} />
              </Route>
            </Routes>
          </MemoryRouter>
        );
      });

      function NavBar() {
        let count = React.useRef(0);
        let navigate = useNavigate();
        React.useEffect(() => {
          count.current++;
        }, [navigate]);
        return (
          <nav>
            <button onClick={() => navigate("/home")}>Home</button>
            <button onClick={() => navigate("/about")}>About</button>
            <p>{`count:${count.current}`}</p>
          </nav>
        );
      }

      // @ts-expect-error
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        [
          <nav>
            <button
              onClick={[Function]}
            >
              Home
            </button>
            <button
              onClick={[Function]}
            >
              About
            </button>
            <p>
              count:0
            </p>
          </nav>,
          <h1>
            Home
          </h1>,
        ]
      `);

      // @ts-expect-error
      let buttons = renderer.root.findAllByType("button");
      TestRenderer.act(() => {
        buttons[1].props.onClick(); // link to /about
      });

      // @ts-expect-error
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        [
          <nav>
            <button
              onClick={[Function]}
            >
              Home
            </button>
            <button
              onClick={[Function]}
            >
              About
            </button>
            <p>
              count:1
            </p>
          </nav>,
          <h1>
            About
          </h1>,
        ]
      `);

      // @ts-expect-error
      buttons = renderer.root.findAllByType("button");
      TestRenderer.act(() => {
        buttons[0].props.onClick(); // link back to /home
      });

      // @ts-expect-error
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        [
          <nav>
            <button
              onClick={[Function]}
            >
              Home
            </button>
            <button
              onClick={[Function]}
            >
              About
            </button>
            <p>
              count:2
            </p>
          </nav>,
          <h1>
            Home
          </h1>,
        ]
      `);
    });
  });

  describe("when relative navigation is handled via @remix-run/router", () => {
    describe("with an absolute href", () => {
      it("navigates to the correct URL", () => {
        let router = createMemoryRouter(
          createRoutesFromElements(
            <>
              <Route path="home" element={<UseNavigateButton to="/about" />} />
              <Route path="about" element={<h1>About</h1>} />
            </>
          ),
          { initialEntries: ["/home"] }
        );

        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(<RouterProvider router={router} />);
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            About
          </h1>
        `);
      });
    });

    describe("with a relative href (relative=route)", () => {
      it("navigates to the correct URL", () => {
        let router = createMemoryRouter(
          createRoutesFromElements(
            <>
              <Route
                path="home"
                element={<UseNavigateButton to="../about" />}
              />
              <Route path="about" element={<h1>About</h1>} />
            </>
          ),
          { initialEntries: ["/home"] }
        );

        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(<RouterProvider router={router} />);
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            About
          </h1>
        `);
      });

      it("handles upward navigation from an index routes", () => {
        let router = createMemoryRouter(
          createRoutesFromElements(
            <>
              <Route path="home">
                <Route index element={<UseNavigateButton to="../about" />} />
              </Route>
              <Route path="about" element={<h1>About</h1>} />
            </>
          ),
          { initialEntries: ["/home"] }
        );

        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(<RouterProvider router={router} />);
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            About
          </h1>
        `);
      });

      it("handles upward navigation from inside a pathless layout route", () => {
        let router = createMemoryRouter(
          createRoutesFromElements(
            <>
              <Route element={<Outlet />}>
                <Route
                  path="home"
                  element={<UseNavigateButton to="../about" />}
                />
              </Route>
              <Route path="about" element={<h1>About</h1>} />
            </>
          ),
          { initialEntries: ["/home"] }
        );

        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(<RouterProvider router={router} />);
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            About
          </h1>
        `);
      });

      it("handles upward navigation from inside multiple pathless layout routes + index route", () => {
        let router = createMemoryRouter(
          createRoutesFromElements(
            <>
              <Route path="home">
                <Route element={<Outlet />}>
                  <Route element={<Outlet />}>
                    <Route element={<Outlet />}>
                      <Route
                        index
                        element={<UseNavigateButton to="../about" />}
                      />
                    </Route>
                  </Route>
                </Route>
              </Route>
              <Route path="about" element={<h1>About</h1>} />
            </>
          ),
          { initialEntries: ["/home"] }
        );

        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(<RouterProvider router={router} />);
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            About
          </h1>
        `);
      });

      it("handles upward navigation from inside multiple pathless layout routes + path route", () => {
        let router = createMemoryRouter(
          createRoutesFromElements(
            <>
              <Route path="home" element={<Outlet />}>
                <Route element={<Outlet />}>
                  <Route element={<Outlet />}>
                    <Route element={<Outlet />}>
                      <Route
                        path="page"
                        element={<UseNavigateButton to="../../about" />}
                      />
                    </Route>
                  </Route>
                </Route>
              </Route>
              <Route path="about" element={<h1>About</h1>} />
            </>
          ),
          { initialEntries: ["/home/page"] }
        );

        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(<RouterProvider router={router} />);
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            About
          </h1>
        `);
      });

      it("handles parent navigation from inside multiple pathless layout routes", () => {
        let router = createMemoryRouter(
          createRoutesFromElements(
            <>
              <Route
                path="home"
                element={
                  <>
                    <h1>Home</h1>
                    <Outlet />
                  </>
                }
              >
                <Route element={<Outlet />}>
                  <Route element={<Outlet />}>
                    <Route element={<Outlet />}>
                      <Route
                        path="page"
                        element={
                          <>
                            <h2>Page</h2>
                            <UseNavigateButton to=".." />
                          </>
                        }
                      />
                    </Route>
                  </Route>
                </Route>
              </Route>
              <Route path="about" element={<h1>About</h1>} />
            </>
          ),
          { initialEntries: ["/home/page"] }
        );

        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(<RouterProvider router={router} />);
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Home
          </h1>
        `);
      });

      it("handles relative navigation from nested index route", () => {
        let router = createMemoryRouter(
          createRoutesFromElements(
            <>
              <Route path="layout">
                <Route path=":param">
                  {/* redirect /layout/:param/ index routes to /layout/:param/dest */}
                  <Route index element={<UseNavigateButton to="dest" />} />
                  <Route path="dest" element={<h1>Destination</h1>} />
                </Route>
              </Route>
            </>
          ),
          { initialEntries: ["/layout/thing"] }
        );

        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(<RouterProvider router={router} />);
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Destination
          </h1>
        `);
      });
    });

    describe("with a relative href (relative=path)", () => {
      it("navigates to the correct URL", () => {
        let router = createMemoryRouter(
          createRoutesFromElements(
            <>
              <Route path="contacts" element={<h1>Contacts</h1>} />
              <Route
                path="contacts/:id"
                element={<UseNavigateButton to=".." relative="path" />}
              />
            </>
          ),
          { initialEntries: ["/contacts/1"] }
        );

        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(<RouterProvider router={router} />);
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Contacts
          </h1>
        `);
      });

      it("handles upward navigation from an index routes", () => {
        let router = createMemoryRouter(
          createRoutesFromElements(
            <>
              <Route path="contacts" element={<h1>Contacts</h1>} />
              <Route path="contacts/:id">
                <Route
                  index
                  element={<UseNavigateButton to=".." relative="path" />}
                />
              </Route>
            </>
          ),
          { initialEntries: ["/contacts/1"] }
        );

        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(<RouterProvider router={router} />);
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Contacts
          </h1>
        `);
      });

      it("handles upward navigation from inside a pathless layout route", () => {
        let router = createMemoryRouter(
          createRoutesFromElements(
            <>
              <Route path="contacts" element={<h1>Contacts</h1>} />
              <Route element={<Outlet />}>
                <Route
                  path="contacts/:id"
                  element={<UseNavigateButton to=".." relative="path" />}
                />
              </Route>
            </>
          ),
          { initialEntries: ["/contacts/1"] }
        );

        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(<RouterProvider router={router} />);
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Contacts
          </h1>
        `);
      });

      it("handles upward navigation from inside multiple pathless layout routes + index route", () => {
        let router = createMemoryRouter(
          createRoutesFromElements(
            <>
              <Route path="contacts" element={<h1>Contacts</h1>} />
              <Route path="contacts/:id">
                <Route element={<Outlet />}>
                  <Route element={<Outlet />}>
                    <Route element={<Outlet />}>
                      <Route
                        index
                        element={<UseNavigateButton to=".." relative="path" />}
                      />
                    </Route>
                  </Route>
                </Route>
              </Route>
            </>
          ),
          { initialEntries: ["/contacts/1"] }
        );

        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(<RouterProvider router={router} />);
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Contacts
          </h1>
        `);
      });

      it("handles upward navigation from inside multiple pathless layout routes + path route", () => {
        let router = createMemoryRouter(
          createRoutesFromElements(
            <>
              <Route path="contacts" element={<Outlet />}>
                <Route index element={<h1>Contacts</h1>} />
                <Route element={<Outlet />}>
                  <Route element={<Outlet />}>
                    <Route element={<Outlet />}>
                      <Route
                        path=":id"
                        element={<UseNavigateButton to=".." relative="path" />}
                      />
                    </Route>
                  </Route>
                </Route>
              </Route>
            </>
          ),
          { initialEntries: ["/contacts/1"] }
        );

        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(<RouterProvider router={router} />);
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Contacts
          </h1>
        `);
      });

      it("handles relative navigation from nested index route", () => {
        let router = createMemoryRouter(
          createRoutesFromElements(
            <>
              <Route path="layout">
                <Route path=":param">
                  {/* redirect /layout/:param/ index routes to /layout/:param/dest */}
                  <Route
                    index
                    element={<UseNavigateButton to="dest" relative="path" />}
                  />
                  <Route path="dest" element={<h1>Destination</h1>} />
                </Route>
              </Route>
            </>
          ),
          { initialEntries: ["/layout/thing"] }
        );

        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(<RouterProvider router={router} />);
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          <h1>
            Destination
          </h1>
        `);
      });

      it("preserves search params and hash", () => {
        let router = createMemoryRouter(
          createRoutesFromElements(
            <>
              <Route path="contacts" element={<Contacts />} />
              <Route
                path="contacts/:id"
                element={
                  <UseNavigateButton to="..?foo=bar#hash" relative="path" />
                }
              />
            </>
          ),
          { initialEntries: ["/contacts/1"] }
        );

        function Contacts() {
          let { search, hash } = useLocation();
          return (
            <>
              <h1>Contacts</h1>
              <p>
                {search}
                {hash}
              </p>
            </>
          );
        }

        let renderer: TestRenderer.ReactTestRenderer;
        TestRenderer.act(() => {
          renderer = TestRenderer.create(<RouterProvider router={router} />);
        });

        // @ts-expect-error
        let button = renderer.root.findByType("button");
        TestRenderer.act(() => button.props.onClick());

        // @ts-expect-error
        expect(renderer.toJSON()).toMatchInlineSnapshot(`
          [
            <h1>
              Contacts
            </h1>,
            <p>
              ?foo=bar
              #hash
            </p>,
          ]
        `);
      });
    });

    it("is stable across location changes", () => {
      let router = createMemoryRouter(
        [
          {
            path: "/",
            Component: () => (
              <>
                <NavBar />
                <Outlet />
              </>
            ),
            children: [
              {
                path: "home",
                element: <h1>Home</h1>,
              },
              {
                path: "about",
                element: <h1>About</h1>,
              },
            ],
          },
        ],
        { initialEntries: ["/home"] }
      );

      let renderer: TestRenderer.ReactTestRenderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(<RouterProvider router={router} />);
      });

      function NavBar() {
        let count = React.useRef(0);
        let navigate = useNavigate();
        React.useEffect(() => {
          count.current++;
        }, [navigate]);
        return (
          <nav>
            <button onClick={() => router.navigate("/home")}>Home</button>
            <button onClick={() => router.navigate("/about")}>About</button>
            <p>{`count:${count.current}`}</p>
          </nav>
        );
      }

      // @ts-expect-error
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        [
          <nav>
            <button
              onClick={[Function]}
            >
              Home
            </button>
            <button
              onClick={[Function]}
            >
              About
            </button>
            <p>
              count:0
            </p>
          </nav>,
          <h1>
            Home
          </h1>,
        ]
      `);

      // @ts-expect-error
      let buttons = renderer.root.findAllByType("button");
      TestRenderer.act(() => {
        buttons[1].props.onClick(); // link to /about
      });

      // @ts-expect-error
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        [
          <nav>
            <button
              onClick={[Function]}
            >
              Home
            </button>
            <button
              onClick={[Function]}
            >
              About
            </button>
            <p>
              count:1
            </p>
          </nav>,
          <h1>
            About
          </h1>,
        ]
      `);

      // @ts-expect-error
      buttons = renderer.root.findAllByType("button");
      TestRenderer.act(() => {
        buttons[0].props.onClick(); // link back to /home
      });

      // @ts-expect-error
      expect(renderer.toJSON()).toMatchInlineSnapshot(`
        [
          <nav>
            <button
              onClick={[Function]}
            >
              Home
            </button>
            <button
              onClick={[Function]}
            >
              About
            </button>
            <p>
              count:1
            </p>
          </nav>,
          <h1>
            Home
          </h1>,
        ]
      `);
    });
  });
});

function UseNavigateButton({
  to,
  relative,
}: {
  to: To;
  relative?: RelativeRoutingType;
}) {
  let navigate = useNavigate();
  return <button onClick={() => navigate(to, { relative })}>Navigate</button>;
}
