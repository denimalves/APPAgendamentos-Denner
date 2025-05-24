<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> APP AGENDAMENTOS </q-toolbar-title>
        <q-space />
        <!-- Exibir Nome do Usuário -->
        <q-span v-if="usuario" color="primary" text-color="white" size="32px" class="q-mr-sm">
          {{ usuario.nome.toUpperCase() }}</q-span
        >

        <!-- Botão de Logout -->
        <q-btn
          v-if="estaAutenticado"
          flat
          dense
          icon="logout"
          label="Sair"
          @click="fazerLogout"
          class="q-ml-auto"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          <q-avatar size="100px" class="q-mb-sm">
            <img src="../assets/logovictoriasmobile.png" />
          </q-avatar>
        </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
    <!-- RODAPÉ -->
    <q-footer class="bg-grey-2 text-black text-center q-pa-md" elevated>
      <div>&copy; 2025 Desenvolvido por Denner Alves | Victoria's Mobile</div>
      <!--
      <div class="q-mt-sm flex flex-center items-center justify-center q-gutter-sm">
        <q-icon name="whatsapp" color="green" size="md" />
        <span>37 9.9861-7367</span>

        <q-icon name="email" color="primary" size="md" class="q-ml-md" />
        <span>denimalves.as@gmail.com</span>
      </div>-->
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import EssentialLink from '../componentes/EssentialLink.vue'
import { useRouter } from 'vue-router'
import autenticar from 'src/servicos/autenticar'

const router = useRouter()
const leftDrawerOpen = ref(false)

const usuario = computed(() => autenticar.getUsuario())
const estaAutenticado = computed(() => autenticar.isAuthenticated())

// Lista de links do menu lateral
const linksList = computed(() => {
  const links = [
    {
      title: 'Home',
      caption: 'Pagina Inicial',
      icon: 'home',
      link: '/',
    },
    {
      title: 'Agendar',
      caption: 'Agende seu Evento',
      icon: 'today',
      link: '/agendarEvento',
    },
    {
      title: 'Agendamentos',
      caption: 'Consulte os Agendamentos',
      icon: 'today',
      link: '/agendamentos',
    },
  ]
  // Só adiciona o link de login se o usuário **não** estiver autenticado
  if (!estaAutenticado.value) {
    links.push({
      title: 'Login',
      caption: 'Faça Login',
      icon: 'login',
      link: '/login',
    })
  }

  return links
})

// Função para alternar a visibilidade do Drawer (Menu lateral)
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function fazerLogout() {
  autenticar.logout()
  router.push({ name: 'login', query: { logout: 'true' } })
}
</script>

<style></style>
