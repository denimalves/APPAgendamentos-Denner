<template>
  <h3 align="center">Agende seu Evento</h3>

  <div class="q-pa-md">
    <div class="q-gutter-md row items-start">
      <q-date v-model="dataSelecionada" mask="DD-MM-YYYY" color="purple" />
      <q-time v-model="horaInicial" mask="HH:mm" color="purple" />
      <q-time v-model="horaFinal" mask="HH:mm" color="purple" />
    </div>
  </div>

  <div class="q-pa-md">
    <q-form @submit.prevent="salvar">
      <q-input v-if="agenda.id" v-model="agenda.id" label="ID" type="number" disable />
      <q-input
        v-model="agenda.data"
        label="Data"
        type="text"
        lazy-rules
        :rules="[(val) => (val && val.length > 0) || 'Campo Obrigatorio']"
        disable
      />
      <q-input v-model="agenda.evento" label="Evento" type="text" />
      <div>
        <q-btn
          label="Cancelar"
          color="white"
          class="float-right"
          text-color="primary"
          icon="cancel"
          :to="{ name: 'agendamentos' }"
        />

        <q-btn label="Salvar" type="submit" color="primary" class="float-right" icon="save" />
      </div>
    </q-form>

    <q-separator class="q-my-md" />
  </div>
</template>

<script setup>
import agendaServicos from 'src/servicos/agenda.js'
import { useQuasar } from 'quasar'
//import router from 'src/router'
import { useRouter, useRoute } from 'vue-router'
import { onMounted, ref, watch } from 'vue'

const agenda = ref({ id: null, data: '', evento: '' })
const dataSelecionada = ref('')
const horaInicial = ref('')
const horaFinal = ref('')
const { inserir, getById, atualizar, listar } = agendaServicos()
const $q = useQuasar()
const router = useRouter()
const route = useRoute()

// Atualiza agenda.data sempre que dataSelecionada ou horaSelecionada mudarem
watch([dataSelecionada, horaInicial, horaFinal], ([data, horaInicio, horaFim]) => {
  if (data && horaInicio && horaFim) {
    agenda.value.data = `${formataData(data)} das ${horaInicio}h as ${horaFim}h`
  }
})

function formataData(iso) {
  const [dia, mes, ano] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

onMounted(async () => {
  if (route.params.id) {
    getAgenda(route.params.id)
  }
})

const getAgenda = async (id) => {
  try {
    const resposta = await getById(id)
    agenda.value = resposta

    //separar a data/hora
    const [data, horaIni, horaFim] = resposta.data.split(' ')
    dataSelecionada.value = data
    horaInicial.value = horaIni
    horaFinal.value = horaFim
  } catch (error) {
    console.log(error)
  }
}

const salvar = async () => {
  try {
    const agendamentosExistentes = await listar() //pega todos agendamentos
    //formato do novo agendamento
    const novoAgendamentoData = dataSelecionada.value
    const novoInicio = horaInicial.value
    const novoFim = horaFinal.value
    // verificar se é no passado
    const [dia, mes, ano] = novoAgendamentoData.split('-') //quebra da data em partes
    const hoje = new Date()
    const novoInicioDate = new Date(`${ano}-${mes}-${dia}T${novoInicio}:00`) //monta um novo objeto tipo data
    const novoFimDate = new Date(`${ano}-${mes}-${dia}T${novoFim}:00`) //monta um novo objeto para tipo data

    //verificar se o agendamento está no passado
    if (novoInicioDate < hoje) {
      $q.notify({
        message: 'Não é permitido agendar no passado',
        icon: 'error',
        color: 'negative',
      })
      return
    }
    //verificar se a hora fim é maior que a inicio
    if (novoInicioDate > novoFimDate) {
      $q.notify({
        message: 'Não é permitido Horario final menor que inicial',
        icon: 'error',
        color: 'negative',
      })
      return
    }
    //verifica conflito
    const conflito = agendamentosExistentes.some((ag) => {
      //funcao some vai percorrer todos agendamentos
      // e retorna true se achar algum

      if (!ag.data) return false //se agendamento vazio ignora proximo passo

      //Match com REGEX para pegar partes da string
      const partes = ag.data.match(
        /(\d{2})\/(\d{2})\/(\d{4}) das (\d{2}):(\d{2})h as (\d{2}):(\d{2})h/,
      )

      if (!partes) return false //Se não conseguir quebrar (formato errado), ignora esse agendamento.

      const [, diaAg, mesAg, anoAg, horaIniAg, minIniAg, horaFimAg, minFimAg] = partes //desestrutura a resposta do regex

      //monta objetos Date com a data e hora do agendamento já existente.
      const agInicio = new Date(`${anoAg}-${mesAg}-${diaAg}T${horaIniAg}:${minIniAg}:00`)
      const agFim = new Date(`${anoAg}-${mesAg}-${diaAg}T${horaFimAg}:${minFimAg}:00`)

      //verifica se os periodos se sobrepoem
      return novoInicioDate < agFim && novoFimDate > agInicio
    })

    if (conflito) {
      $q.notify({
        message: 'Ja existe um agendamento nesse horario',
        icon: 'error',
        color: 'negative',
      })

      return //não salva
    }

    if (agenda.value.id) {
      await atualizar(agenda.value)
    } else {
      await inserir(agenda.value)
    }

    $q.notify({ message: 'Salvo com sucesso', icon: 'check', color: 'positive' })

    router.push({ name: 'agendamentos' })
  } catch (error) {
    alert(error)
  }
}
</script>
