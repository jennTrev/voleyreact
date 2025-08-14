"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, MapPin, User } from "lucide-react"
import { Navbar } from "../componentes/navbar"
import { AppSidebar } from "../componentes/sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export default function HorariosEntrenamientoPage() {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  const horasDelDia = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ]
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  const entrenamientos = {
    Lunes: {
      "16:00": { categoria: "Damas Universitario", lugar: "Gimnasio A", entrenador: "Prof. María López", duracion: 2 },
      "20:00": {
        categoria: "Varones Universitario",
        lugar: "Gimnasio B",
        entrenador: "Prof. Roberto Silva",
        duracion: 2,
      },
    },
    Martes: {
      "17:00": { categoria: "Damas Sub-18", lugar: "Gimnasio A", entrenador: "Prof. Ana García", duracion: 2 },
      "19:30": {
        categoria: "Preparación Física",
        lugar: "Sala Musculación",
        entrenador: "Prof. Diego Morales",
        duracion: 1.5,
      },
    },
    Miércoles: {
      "16:00": { categoria: "Damas Universitario", lugar: "Gimnasio A", entrenador: "Prof. María López", duracion: 2 },
      "18:00": { categoria: "Varones Sub-18", lugar: "Gimnasio B", entrenador: "Prof. Carlos Mendoza", duracion: 2 },
    },
    Jueves: {
      "17:00": { categoria: "Damas Sub-18", lugar: "Gimnasio A", entrenador: "Prof. Ana García", duracion: 2 },
      "20:00": {
        categoria: "Varones Universitario",
        lugar: "Gimnasio B",
        entrenador: "Prof. Roberto Silva",
        duracion: 2,
      },
    },
    Viernes: {
      "16:00": {
        categoria: "Entrenamiento Conjunto",
        lugar: "Gimnasio Principal",
        entrenador: "Todos los entrenadores",
        duracion: 2,
      },
      "18:00": { categoria: "Varones Sub-18", lugar: "Gimnasio B", entrenador: "Prof. Carlos Mendoza", duracion: 2 },
    },
    Sábado: {
      "09:00": { categoria: "Damas Sub-18", lugar: "Gimnasio A", entrenador: "Prof. Ana García", duracion: 2 },
      "15:00": {
        categoria: "Partidos de Práctica",
        lugar: "Gimnasio Principal",
        entrenador: "Supervisión general",
        duracion: 2,
      },
    },
    Domingo: {
      "10:00": {
        categoria: "Descanso Activo",
        lugar: "Piscina Universitaria",
        entrenador: "Prof. Diego Morales",
        duracion: 2,
      },
    },
  }

  const getEntrenamientoEnHora = (dia, hora) => {
    return entrenamientos[dia]?.[hora] || null
  }

  const getCategoriaColor = (categoria) => {
    if (categoria?.includes("Damas Universitario")) return "bg-pink-100 border-pink-400 text-pink-800"
    if (categoria?.includes("Varones Universitario")) return "bg-blue-100 border-blue-400 text-blue-800"
    if (categoria?.includes("Damas Sub-18")) return "bg-purple-100 border-purple-400 text-purple-800"
    if (categoria?.includes("Varones Sub-18")) return "bg-green-100 border-green-400 text-green-800"
    if (categoria?.includes("Preparación Física")) return "bg-orange-100 border-orange-400 text-orange-800"
    if (categoria?.includes("Entrenamiento Conjunto"))
      return "bg-[#800020] bg-opacity-10 border-[#800020] text-[#800020]"
    return "bg-gray-100 border-gray-400 text-gray-800"
  }

  return (
    <>
      <Navbar />

      <div className="flex">
        {!isLoginPage && <AppSidebar />}

        <SidebarInset className="flex-1">
          <div className="min-h-screen bg-white">
            <div className="container mx-auto px-6 py-12">
              <div className="mb-8">
                <Button
                  asChild
                  variant="outline"
                  className="border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white bg-transparent"
                >
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al inicio
                  </Link>
                </Button>
              </div>

              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h1 className="text-5xl font-bold text-black mb-4">Horarios de Entrenamiento</h1>
                  <p className="text-xl text-gray-600">Calendario semanal - Selección Univalle</p>
                </div>

                <Card className="bg-white border-gray-200 shadow-lg mb-8">
                  <CardHeader className="bg-[#800020] text-white">
                    <CardTitle className="text-2xl text-center">Calendario Semanal de Entrenamientos</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <div className="min-w-[800px]">
                        {/* Header with days */}
                        <div className="grid grid-cols-8 border-b border-gray-200">
                          <div className="p-3 bg-gray-50 border-r border-gray-200 font-semibold text-center text-sm">
                            Hora
                          </div>
                          {diasSemana.map((dia) => (
                            <div
                              key={dia}
                              className="p-3 bg-gray-50 border-r border-gray-200 font-semibold text-center text-sm"
                            >
                              {dia}
                            </div>
                          ))}
                        </div>

                        {/* Time slots */}
                        {horasDelDia.map((hora) => (
                          <div key={hora} className="grid grid-cols-8 border-b border-gray-200 min-h-[60px]">
                            <div className="p-3 bg-gray-50 border-r border-gray-200 text-sm font-medium text-center flex items-center justify-center">
                              {hora}
                            </div>
                            {diasSemana.map((dia) => {
                              const entrenamiento = getEntrenamientoEnHora(dia, hora)
                              return (
                                <div key={`${dia}-${hora}`} className="border-r border-gray-200 p-1 relative">
                                  {entrenamiento && (
                                    <div
                                      className={`p-2 rounded-md border-l-4 text-xs ${getCategoriaColor(entrenamiento.categoria)} h-full`}
                                    >
                                      <div className="font-semibold mb-1">{entrenamiento.categoria}</div>
                                      <div className="flex items-center mb-1">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        <span className="truncate">{entrenamiento.lugar}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <User className="w-3 h-3 mr-1" />
                                        <span className="truncate">{entrenamiento.entrenador}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-lg mb-8">
                  <CardHeader>
                    <CardTitle className="text-black text-center">Leyenda de Categorías</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-pink-100 border-l-4 border-pink-400 mr-2"></div>
                        <span className="text-sm">Damas Universitario</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-100 border-l-4 border-blue-400 mr-2"></div>
                        <span className="text-sm">Varones Universitario</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-purple-100 border-l-4 border-purple-400 mr-2"></div>
                        <span className="text-sm">Damas Sub-18</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-100 border-l-4 border-green-400 mr-2"></div>
                        <span className="text-sm">Varones Sub-18</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-orange-100 border-l-4 border-orange-400 mr-2"></div>
                        <span className="text-sm">Preparación Física</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-[#800020] bg-opacity-10 border-l-4 border-[#800020] mr-2"></div>
                        <span className="text-sm">Entrenamiento Conjunto</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-8 bg-white border-gray-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-black text-center">Instalaciones Deportivas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                      <div className="p-4">
                        <h4 className="text-[#800020] font-bold mb-2">Gimnasio Principal</h4>
                        <p className="text-gray-600 text-sm">Cancha oficial con capacidad para 500 espectadores</p>
                      </div>
                      <div className="p-4">
                        <h4 className="text-[#800020] font-bold mb-2">Gimnasios A y B</h4>
                        <p className="text-gray-600 text-sm">Canchas de entrenamiento con equipamiento profesional</p>
                      </div>
                      <div className="p-4">
                        <h4 className="text-[#800020] font-bold mb-2">Sala de Musculación</h4>
                        <p className="text-gray-600 text-sm">Equipos especializados para preparación física</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </>
  )
}
