<template>
  <div class="p-4 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-8 text-center">MEAL STOCK</h1>

    <!-- 登録済みの作り置き一覧 -->
    <div>
      <h2 class="text-xl font-bold mb-4">登録済みSTOCK</h2>
      <div
        v-if="stockItems.length === 0"
        class="text-gray-500"
      >
        まだ作り置きが登録されていません
      </div>
      <div
        v-else
        class="space-y-3"
      >
        <div
          v-for="item in stockItems"
          :key="item.id"
          class="p-3 border rounded-lg bg-gray-50"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold">{{ item.name }}</h3>
              <p class="text-sm text-gray-600">{{ item.storage_type }}</p>
              <p class="text-sm text-gray-600">
                {{ item.duration_days }}日保存
              </p>
            </div>
            <button
              @click="deleteStock(item.id)"
              class="text-red-500 hover:text-red-700 text-sm"
            >
              削除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- フローティングボタン -->
    <button
      @click="toggleForm"
      class="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 flex items-center justify-center text-2xl z-50"
    >
      <span v-if="!showForm">+</span>
      <span v-else>×</span>
    </button>

    <!-- スライドインフォーム -->
    <div
      v-show="showForm"
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
      @click="closeForm"
    >
      <div
        class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto"
        :class="showForm ? 'translate-x-0' : 'translate-x-full'"
        @click.stop
      >
        <div class="p-6">
          <h2 class="text-xl font-bold mb-6">新規STOCK</h2>
          
          <form
            @submit.prevent="addStock"
            class="flex flex-col gap-3"
          >
            <input
        v-model="name"
        type="text"
        placeholder="料理名（例：ラタトゥイユ）"
              class="p-2 border rounded"
              required
            />

            <select
              v-model="storageType"
              class="p-2 border rounded"
              required
            >
              <option
                disabled
                value=""
              >
                保存場所を選択
              </option>
              <option value="冷蔵">冷蔵</option>
              <option value="冷凍">冷凍</option>
              <option value="常温">常温</option>
            </select>

            <input
              v-model.number="durationDays"
              type="number"
              min="1"
              placeholder="保存日数（例：7）"
              class="p-2 border rounded"
              required
            />

            <button
              type="submit"
              class="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              登録する
            </button>
          </form>

          <!-- テンプレート一覧 -->
          <div class="mt-8">
            <h2 class="text-xl font-bold mb-4">過去に登録したSTOCK</h2>
            <div
              v-if="templates.length === 0"
              class="text-gray-500 mb-4"
            >
              まだテンプレートが保存されていません
            </div>
            <div
              v-else
              class="space-y-2 mb-4"
            >
              <div
                v-for="template in templates"
                :key="template.id"
                class="flex items-center p-3 border rounded-lg bg-gray-50"
              >
                <input
                  v-model="selectedTemplate"
                  type="radio"
                  :value="template.id"
                  @change="applyTemplate(template.id)"
                  class="mr-3 cursor-pointer"
                />
                <div class="flex-1 cursor-pointer" @click="applyTemplate(template.id)">
                  <div class="font-semibold">{{ template.name }}</div>
                  <div class="text-sm text-gray-600">
                    {{ template.storage_type }} / {{ template.duration_days }}日保存
                  </div>
                </div>
                <button
                  @click="deleteTemplate(template.id)"
                  class="text-red-500 hover:text-red-700 text-sm ml-2"
                >
                  削除
                </button>
              </div>
              <button
                v-if="selectedTemplate"
                @click="clearSelection"
                class="w-full py-2 mt-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                選択をクリア
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface StockItem {
  id: string
  name: string
  storage_type: string
  duration_days: number
  status: string
  created_at: string
}

const name = ref('')
const storageType = ref('')
const durationDays = ref<number | null>(null)
const stockItems = ref<StockItem[]>([])

interface Template {
  id: string
  name: string
  storage_type: string
  duration_days: number
  created_at: string
}

const templates = ref<Template[]>([])
const selectedTemplate = ref<string>('')

// 表示状態管理
const showForm = ref(false)

// フォーム表示制御
const toggleForm = () => {
  showForm.value = !showForm.value
}

const closeForm = () => {
  showForm.value = false
}

const fetchStockItems = async () => {
  const { $supabase } = useNuxtApp()
  console.log('データ取得開始')

  // まず全データを取得してみる
  const { data: allData, error: allError } = await $supabase
    .from('stock_items')
    .select('*')

  console.log('全データ:', allData, 'エラー:', allError)

  // activeのみを取得
  const { data, error } = await $supabase
    .from('stock_items')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  console.log('activeデータ:', data, 'エラー:', error)

  if (error) {
    console.error('データ取得エラー:', error)
  } else {
    stockItems.value = data || []
    console.log('stockItems.value設定完了:', stockItems.value)
  }
}

const addStock = async () => {
  const { $supabase } = useNuxtApp()
  console.log('登録開始:', {
    name: name.value,
    storage_type: storageType.value,
    duration_days: durationDays.value,
    status: 'active',
  })

  const { data, error } = await $supabase
    .from('stock_items')
    .insert({
      name: name.value,
      storage_type: storageType.value,
      duration_days: durationDays.value,
      status: 'active',
    })
    .select()

  console.log('登録結果:', data, 'エラー:', error)

  if (error) {
    alert('登録失敗: ' + error.message)
    console.error('詳細エラー:', error)
  } else {
    alert('登録しました！')

    // テンプレート保存の確認
    const saveAsTemplate = confirm(
      'この選択肢をテンプレートとして保存しますか？'
    )
    if (saveAsTemplate) {
      await saveTemplate({
        name: name.value,
        storage_type: storageType.value,
        duration_days: durationDays.value || 0,
      })
    }

    name.value = ''
    storageType.value = ''
    durationDays.value = null
    await fetchStockItems()
    closeForm()
  }
}

const deleteStock = async (id: string) => {
  console.log('削除ボタンがクリックされました！ ID:', id)

  if (!confirm('本当に削除しますか？')) {
    console.log('削除がキャンセルされました')
    return
  }

  const { $supabase } = useNuxtApp()
  console.log('削除開始:', id)

  // まず該当レコードが存在するかチェック
  const { data: existingRecord, error: checkError } = await $supabase
    .from('stock_items')
    .select('*')
    .eq('id', id)
    .single()

  console.log('レコード存在確認:', existingRecord, 'エラー:', checkError)

  if (checkError || !existingRecord) {
    console.error('削除対象のレコードが見つかりません:', checkError)
    alert('削除対象のレコードが見つかりません')
    return
  }

  // 物理削除を実行
  const { error } = await $supabase.from('stock_items').delete().eq('id', id)

  console.log('削除エラー:', error)

  if (error) {
    console.error('削除エラー詳細:', error)
    alert('削除失敗: ' + error.message)
  } else {
    alert('削除しました！')
    await fetchStockItems()
  }
}

// テンプレート保存機能
const saveTemplate = async (template: {
  name: string
  storage_type: string
  duration_days: number
}) => {
  const { $supabase } = useNuxtApp()

  // 認証状態を確認
  const {
    data: { user },
  } = await $supabase.auth.getUser()
  console.log('現在のユーザー:', user)

  const { error } = await $supabase.from('meal_templates').insert({
    name: template.name,
    storage_type: template.storage_type,
    duration_days: template.duration_days,
  })

  if (error) {
    console.error('テンプレート保存エラー:', error)
    alert('テンプレートの保存に失敗しました')
  } else {
    alert('テンプレートを保存しました！')
    await fetchTemplates()
  }
}

// テンプレート一覧取得
const fetchTemplates = async () => {
  const { $supabase } = useNuxtApp()

  const { data, error } = await $supabase
    .from('meal_templates')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('テンプレート取得エラー:', error)
  } else {
    templates.value = data || []
  }
}

// テンプレートを選択して入力欄に反映
const applyTemplate = (templateId: string) => {
  const template = templates.value.find((t) => t.id === templateId)
  if (template) {
    name.value = template.name
    storageType.value = template.storage_type
    durationDays.value = template.duration_days
  }
}

// テンプレート選択をクリア
const clearSelection = () => {
  selectedTemplate.value = ''
  name.value = ''
  storageType.value = ''
  durationDays.value = null
}

// テンプレート削除機能
const deleteTemplate = async (templateId: string) => {
  if (!confirm('このテンプレートを削除しますか？')) {
    return
  }

  const { $supabase } = useNuxtApp()
  
  const { error } = await $supabase
    .from('meal_templates')
    .delete()
    .eq('id', templateId)

  if (error) {
    console.error('テンプレート削除エラー:', error)
    alert('テンプレートの削除に失敗しました')
  } else {
    alert('テンプレートを削除しました！')
    // 削除されたテンプレートが選択されていた場合、選択をクリア
    if (selectedTemplate.value === templateId) {
      clearSelection()
    }
    await fetchTemplates()
  }
}

onMounted(() => {
  fetchStockItems()
  fetchTemplates()
})
</script>
