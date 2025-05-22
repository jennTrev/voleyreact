"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Home, Users, BarChart2, LogOut, Menu, Zap, Activity, Cpu } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const router = useRouter()
  const [activeItem, setActiveItem] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const navbarRef = useRef(null)
  const selectorRef = useRef(null)
  const navItemsRef = useRef([])

  // Definir menús según el rol
  const getMenuItems = (role) => {
    switch (role) {
      case "jugador":
        return [
          { name: "Inicio", icon: <Home size={18} />, href: "/inicio" },
          { name: "Estadísticas", icon: <BarChart2 size={18} />, href: "/estadisticas" },
          {
            name: "Salir",
            icon: <LogOut size={18} />,
            href: "#",
            onClick: () => {
              localStorage.removeItem("userId")
              localStorage.removeItem("userRole")
              router.push("/")
            },
          },
        ]
      case "entrenador":
        return [
          { name: "Inicio", icon: <Home size={18} />, href: "/inicio" },
          { name: "Jugadores", icon: <Users size={18} />, href: "/Usuarios" },
          { name: "Prueba Reacción", icon: <Zap size={18} />, href: "/prueba-reaccion" },
          { name: "Prueba Salto", icon: <Activity size={18} />, href: "/prueba-salto" },
           { name: "Resultados", icon: <Activity size={18} />, href: "/resultados" },
          {
            name: "Salir",
            icon: <LogOut size={18} />,
            href: "#",
            onClick: () => {
              localStorage.removeItem("userId")
              localStorage.removeItem("userRole")
              router.push("/")
            },
          },
        ]
      case "tecnico":
        return [
          { name: "Inicio", icon: <Home size={18} />, href: "/inicio" },
          { name: "Monitoreo", icon: <Cpu size={18} />, href: "/monitoreo" },
          {
            name: "Salir",
            icon: <LogOut size={18} />,
            href: "#",
            onClick: () => {
              localStorage.removeItem("userId")
              localStorage.removeItem("userRole")
              router.push("/")
            },
          },
        ]
      default:
        return [
          { name: "Inicio", icon: <Home size={18} />, href: "/inicio" },
          {
            name: "Salir",
            icon: <LogOut size={18} />,
            href: "#",
            onClick: () => {
              localStorage.removeItem("userId")
              localStorage.removeItem("userRole")
              router.push("/")
            },
          },
        ]
    }
  }

  // Obtener el rol del usuario al cargar el componente
  useEffect(() => {
    // Primero intentar obtener el rol desde localStorage
    const storedRole = localStorage.getItem("userRole")

    if (storedRole) {
      setUserRole(storedRole)
    } else {
      // Si no está en localStorage, obtenerlo de la API
      const checkUserRole = async () => {
        const userId = localStorage.getItem("userId")

        if (userId) {
          try {
            const response = await fetch(`https://jenn.onrender.com/usuarios/${userId}`)

            if (response.ok) {
              const userData = await response.json()
              setUserRole(userData.rol)

              // Guardar el rol en localStorage para futuras referencias
              localStorage.setItem("userRole", userData.rol)
            }
          } catch (error) {
            console.error("Error al verificar el rol del usuario:", error)
            setUserRole("jugador") // Valor predeterminado en caso de error
          }
        }
      }

      checkUserRole()
    }
  }, [])

  // Obtener menú basado en el rol actual
  const menuItems = getMenuItems(userRole || "jugador")

  // Establecer el elemento activo según la ruta actual
  useEffect(() => {
    if (userRole) {
      const path = window.location.pathname

      // Determinar el índice activo basado en la ruta actual
      let activeIndex = 0
      const currentMenuItems = getMenuItems(userRole)

      for (let i = 0; i < currentMenuItems.length; i++) {
        if (path.includes(currentMenuItems[i].href) && currentMenuItems[i].href !== "/inicio") {
          activeIndex = i
          break
        }
      }

      setActiveItem(activeIndex)
    }
  }, [userRole, router])

  // Actualizar la posición del selector cuando cambia el elemento activo
  useEffect(() => {
    if (navItemsRef.current.length > 0 && selectorRef.current) {
      const activeElement = navItemsRef.current[activeItem]
      if (activeElement) {
        const isDesktop = window.innerWidth >= 992

        if (isDesktop) {
          // Posicionamiento en escritorio
          selectorRef.current.style.top = `${activeElement.offsetTop}px`
          selectorRef.current.style.left = `${activeElement.offsetLeft}px`
          selectorRef.current.style.width = `${activeElement.offsetWidth}px`
          selectorRef.current.style.height = `${activeElement.offsetHeight}px`
        } else {
          // Posicionamiento en móvil
          selectorRef.current.style.top = `${activeElement.offsetTop}px`
          selectorRef.current.style.left = "10px"
          selectorRef.current.style.width = "5px"
          selectorRef.current.style.height = `${activeElement.offsetHeight}px`
        }
      }
    }
  }, [activeItem, isMobileMenuOpen, userRole])

  // Manejar el cambio de tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      if (navItemsRef.current.length > 0 && selectorRef.current) {
        const activeElement = navItemsRef.current[activeItem]
        if (activeElement) {
          const isDesktop = window.innerWidth >= 992

          if (isDesktop) {
            // Posicionamiento en escritorio
            selectorRef.current.style.top = `${activeElement.offsetTop}px`
            selectorRef.current.style.left = `${activeElement.offsetLeft}px`
            selectorRef.current.style.width = `${activeElement.offsetWidth}px`
            selectorRef.current.style.height = `${activeElement.offsetHeight}px`
          } else {
            // Posicionamiento en móvil
            selectorRef.current.style.top = `${activeElement.offsetTop}px`
            selectorRef.current.style.left = "10px"
            selectorRef.current.style.width = "5px"
            selectorRef.current.style.height = `${activeElement.offsetHeight}px`
          }
        }
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [activeItem])

  return (
    <nav className="bg-[#1E3A8A] px-4 py-0 relative" ref={navbarRef}>
      <div className="flex justify-between items-center">
        <Link href="/inicio" className="text-white py-4 font-bold text-xl">
          ReactVolt
        </Link>

        <button
          className="lg:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Alternar navegación"
        >
          <Menu size={24} />
        </button>

        <div
          className={`lg:flex ${isMobileMenuOpen ? "block" : "hidden"} lg:items-center transition-all duration-300 w-full lg:w-auto`}
        >
          <ul className="lg:flex flex-col lg:flex-row relative p-0 m-0">
            {/* Selector horizontal - Cambiado a un color con mejor contraste */}
            <div
              ref={selectorRef}
              className="absolute bg-[#4F85E5] transition-all duration-600 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] rounded-t-lg lg:mt-2.5"
            >
              <div className="absolute w-6 h-6 bg-[#4F85E5] bottom-2.5 -right-6 before:content-[''] before:absolute before:w-12 before:h-12 before:rounded-full before:bg-[#1E3A8A] before:bottom-0 before:-right-6"></div>
              <div className="absolute w-6 h-6 bg-[#4F85E5] bottom-2.5 -left-6 before:content-[''] before:absolute before:w-12 before:h-12 before:rounded-full before:bg-[#1E3A8A] before:bottom-0 before:-left-6"></div>
            </div>

            {/* Elementos del menú */}
            {menuItems.map((item, index) => (
              <li
                key={index}
                ref={(el) => (navItemsRef.current[index] = el)}
                className={`list-none ${activeItem === index ? "active" : ""}`}
              >
                <Link
                  href={item.href}
                  className={`no-underline text-base block py-5 px-5 transition-duration-600 transition-timing-function-[cubic-bezier(0.68,-0.55,0.265,1.55)] relative ${
                    activeItem === index ? "text-white font-medium" : "text-white/70 hover:text-white"
                  }`}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault()
                      item.onClick()
                    }
                    setActiveItem(index)
                    if (window.innerWidth < 992) {
                      setIsMobileMenuOpen(false)
                    }
                  }}
                >
                  <span className="mr-2.5">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}
