<script setup>
import debounce from "lodash.debounce";

definePage({
  meta: {
    layout: "admin",
    requiresAuth: true,
    subject: "Admin",
    action: "manage",
    nav: "vertical",
  },
});

const userList = ref([]);
const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
});
const total = ref(0);
const referralMap = reactive(new Map());
const search = ref("");
const loading = ref(false);
const referredCount = ref(0);

// headers
const headers = [
  { title: "Username", key: "username" },
  { title: "Display Name", key: "displayName" },
  { title: "Gold", key: "gold" },
  { title: "Food", key: "food" },
  { title: "Token", key: "token" },
  { title: "Slot plays", key: "slotMachinePlays" },
];

onMounted(async () => {});

const fetchUsers = async () => {
  try {
    loading.value = true;

    let payload = {
      page: options.value.page,
      itemsPerPage: options.value.itemsPerPage,
    };

    const keyword = (search.value || "").trim();
    if (keyword) {
      payload.phrase = keyword;
    }

    if (options.value.sortBy.length) {
      payload.sortBy = options.value.sortBy[0].key;
      payload.sortOrder = options.value.sortBy[0].order;
    }

    const { data, meta } = await getAllUsers(payload);

    userList.value = data;
    total.value = meta.total;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const onExpandClick = async (item, isExpanded, toggleExpand) => {
  const expanded = isExpanded(item);
  const userId = item.raw._id;

  if (!expanded && !referralMap.has(userId)) {
    try {
      const data = await getReferralTree(userId);
      referralMap.set(userId, data);
      referredCount.value = data.referredCount;
    } catch (err) {
      console.error("Failed to load details", err);
      return;
    }
  }

  toggleExpand(item);
};

const debouncedFetchUsers = debounce(() => {
  fetchUsers();
}, 300);

watch(search, (val) => {
  const value = (val || "").trim();

  if (value === "") {
    fetchUsers();
  } else {
    debouncedFetchUsers();
  }
});
</script>

<template>
  <v-data-table-server
    :headers="headers"
    :items="userList"
    v-model:items-per-page="options.itemsPerPage"
    :items-length="total"
    item-value="_id"
    v-model:page="options.page"
    v-model:sort-by="options.sortBy"
    :options="options"
    @update:options="fetchUsers"
    :items-per-page-options="[5, 10, 25, 50]"
    show-expand
    :loading="loading"
  >
    <template v-slot:top>
      <v-text-field
        v-model="search"
        class="tw-p-4"
        label="Search"
        clearable=""
      ></v-text-field>
    </template>
    <template
      v-slot:item.data-table-expand="{ internalItem, isExpanded, toggleExpand }"
    >
      <v-btn
        :append-icon="
          isExpanded(internalItem) ? 'mdi-chevron-up' : 'mdi-chevron-down'
        "
        :text="isExpanded(internalItem) ? 'Collapse' : 'Refferal info'"
        class="text-none"
        color="medium-emphasis"
        size="small"
        variant="text"
        border
        slim
        @click="() => onExpandClick(internalItem, isExpanded, toggleExpand)"
      ></v-btn>
    </template>

    <template v-slot:expanded-row="{ columns, item }">
      <tr>
        <td :colspan="columns.length" class="!tw-p-4">
          <div v-if="referralMap.get(item._id)">
            <div>
              <span class="tw-font-bold">Refferer: </span>

              <span
                v-if="
                  referralMap.get(item._id)?.referrer &&
                  Object.keys(referralMap.get(item._id)?.referrer).length
                "
              >
                {{ referralMap.get(item._id)?.referrer.displayName }} ({{
                  referralMap.get(item._id)?.referrer.username
                }})
              </span>
              <span v-else class="tw-italic">No refferer</span>
            </div>
            <div>
              <span class="tw-font-bold">Reffered Users: </span>
              <span v-if="referralMap.get(item._id)?.referredUsers?.length">
                ({{ referredCount || 0 }} users)
                {{
                  referralMap
                    .get(item._id)
                    ?.referredUsers.map(
                      (ref) => `${ref.displayName} (${ref.username})`
                    )
                    .join(" | ")
                }}
              </span>
              <span v-else class="tw-italic">No reffered users</span>
            </div>
          </div>
          <div v-else>Loading...</div>
        </td>
      </tr>
    </template>
  </v-data-table-server>
</template>
