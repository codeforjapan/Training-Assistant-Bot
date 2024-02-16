<template>
  <v-row align="center" justify="center">
    <v-card min-width="500" max-width="60%" flat color="rgba(0,0,0,0)">
      <v-card-title class="headline text-center">
        <p>{{ $t('防災訓練ボット管理画面') }}</p>
        <p>{{ $t('ログイン') }}</p>
      </v-card-title>
      <v-form v-model="formStatus.valid" @submit.prevent="login">
        <v-card-text>
          <v-row align="center" justify="center">
            <v-col cols="3">
              <span> {{ $t('ログインID') }}</span>
            </v-col>
            <v-col>
              <v-text-field
                key="username"
                v-model="loginInfo.username"
                :rules="[requiredRule]"
                hide-details
                required
                solo
                flat
                outlined
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row align="center" justify="center">
            <v-col cols="3">
              <span> {{ $t('パスワード') }}</span>
            </v-col>
            <v-col>
              <v-text-field
                key="password"
                v-model="loginInfo.password"
                :rules="[requiredRule]"
                type="password"
                hide-details
                required
                solo
                flat
                outlined
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row align="center" justify="center">
            <v-checkbox
              v-model="loginInfo.keepSession"
              :label="$t('ログイン状態を保持する')"
              class="mx-2"
            ></v-checkbox>
          </v-row>
          <v-alert v-show="signInState.failed" type="error" prominent>
            {{ $t('ユーザ名またはパスワードが違います') }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            type="submit"
            variant="outlined"
            color="#6479C0"
            class="mb-3"
            width="70%"
            height="55"
            :dark="formStatus.valid"
            rounded
            :disabled="!formStatus.valid"
            :loading="formStatus.submitting"
          >
            {{ $t('ログイン') }}
          </v-btn>
          <v-spacer />
        </v-card-actions>
      </v-form>
    </v-card>
  </v-row>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'login',
});

const i18n = useI18n();
const router = useRouter();
const $api = useApi();

const formStatus = reactive({
  valid: false,
  submitting: false,
});
const requiredRule = (value: string) => !!value || i18n.t('必須です');
const loginInfo = reactive({
  username: '',
  password: '',
  keepSession: false,
});
const signInState = reactive({
  failed: false,
});

const login = async () => {
  formStatus.submitting = true;
  signInState.failed = false;
  try {
    await $api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginInfo),
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    await router.push('/');
    signInState.failed = false;
  } catch (err) {
    signInState.failed = true;
  }
  formStatus.submitting = false;
};
</script>
