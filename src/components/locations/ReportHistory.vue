<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { z } from "zod";
import { getResponseFromAPIRequest } from "../../lib/apiRequest";
import { formatDate } from "../../lib/formatDate";
import { reportSchema, APIReport } from "../../lib/schemas/report";

const { t } = useI18n();

const reportHistory = ref<APIReport[] | number | null>(null);
(async () => {
  const response = await getResponseFromAPIRequest("/me/reports?autoget=1", {
    auth: true,
    schema: z.object({
      autoget: reportSchema.array(),
    }),
  });
  if ("status" in response) {
    reportHistory.value = response.status;
    return;
  }
  reportHistory.value = response.autoget;
})();
</script>

<template>
  <div v-if="reportHistory === null">{{ t("reportsLoading") }}</div>
  <div v-else-if="typeof reportHistory === 'number'">
    {{ t("reportsFail", { status: reportHistory }) }}
  </div>
  <div v-else>
    <table
      class="[&_td]:border-[1px] [&_td]:border-text [&_td]:px-2 [&_td]:py-1 [&_th]:border-[1px] [&_th]:border-text [&_th]:px-2 [&_th]:py-1"
    >
      <thead>
        <th>{{ t("reportHistoryPost") }}</th>
        <th>{{ t("reportHistoryReason") }}</th>
        <th>{{ t("reportHistoryStatus") }}</th>
        <th>{{ t("reportHistoryDate") }}</th>
      </thead>
      <tbody>
        <tr v-for="report in reportHistory">
          <td>
            <span v-if="report.content">
              <span v-if="'lower_username' in report.content">
                {{ t("reportHistoryUser", { username: report.content._id }) }}
              </span>
              <span v-else>{{
                t(
                  report.content.isDeleted
                    ? "reportHistoryDeletedPost"
                    : "reportHistoryKnownPost",
                  { name: report.content.u },
                )
              }}</span></span
            >
            <span v-else>{{ t("reportHistoryUnknownPost") }}</span>
          </td>
          <td>{{ report.reason }}<br />{{ report.comment }}</td>
          <td>{{ t(`reportHistory_${report.status}`) }}</td>
          <td>{{ formatDate(report.time) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
../../lib/schemas/report
