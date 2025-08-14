"use client"
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Users,
  Trophy,
  LogOut,
  UserCheck,
  FileText,
  Calendar,
  Activity,
  Menu,
  User,
  TrendingUp,
  ClipboardList,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

export default function AppSidebar({ ...props }) {
  const router = useRouter();
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();
  const [userRole, setUserRole] = useState(""); // Cambié aquí

  useEffect(() => {
    const rol = localStorage.getItem("rol");
    const token = localStorage.getItem("token");
    const idUser  = localStorage.getItem("idUser ");

    if (rol && token && idUser ) {
      setUserRole(rol);
    } else {
      setUserRole("");
    }
  }, []);

  // No mostrar sidebar si estamos en login o no hay rol/token/idUser 
  if (pathname === "/login" || !userRole) {
    return null;
  }

  const getMenuItems = () => {
    switch (userRole) {
      case "tecnico":
        return [
          { icon: UserCheck, label: "Entrenadores", href: "/entrenador" },
          { icon: Activity, label: "Monitoreo", href: "/monitoreo" },
          { icon: User, label: "Perfil", href: "/perfil" },
        ];
      case "entrenador":
        return [
          { icon: Users, label: "Jugadores", href: "/jugadores" },
          { icon: Trophy, label: "Ranking Semanal", href: "/rankinsemanal" },
          { icon: Calendar, label: "Horarios", href: "/horarios" },
          { icon: ClipboardList, label: "Prueba", href: "/prueba" },
          { icon: FileText, label: "Resultados", href: "/resultados" },
          { icon: User, label: "Perfil", href: "/perfil" },
        ];
      case "jugador":
        return [
          { icon: FileText, label: "Resultados", href: "/resultados" },
          { icon: Calendar, label: "Horarios", href: "/horarios" },
          { icon: Trophy, label: "Ranking Semanal", href: "/rankinsemanal" },
          { icon: TrendingUp, label: "Ranking Mensual", href: "/rankinmensual" },
          { icon: User, label: "Perfil", href: "/perfil" },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const iconSizeClass = collapsed ? "h-12 w-12" : "h-6 w-6";

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch("https://voley-backend-nhyl.onrender.com/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("idUser ");
      localStorage.removeItem("rol");
      localStorage.removeItem("user");
      router.push("/");
    }
  };

  return (
    <Sidebar collapsible="icon" className="w-72" railClassName="w-24" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-[#800020] hover:text-white"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#800020] text-white">
                <Menu className={`size-6 ${collapsed ? "size-8" : "size-5"}`} />
              </div>
              {!collapsed && (
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-[#800020]">Menú</span>
                  <span className="text-xs text-[#a64d66] capitalize">{userRole || "Usuario"}</span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#800020] capitalize">Panel {userRole}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`${
                        isActive
                          ? "bg-[#800020] text-white hover:bg-[#800020] hover:text-white"
                          : "text-black hover:bg-[#800020] hover:text-white"
                      }`}
                    >
                      <Link href={item.href}>
                        <Icon className={iconSizeClass} />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-[#800020] hover:bg-[#800020] hover:text-white">
              <LogOut className={iconSizeClass} />
              {!collapsed && <span>Cerrar Sesión</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
