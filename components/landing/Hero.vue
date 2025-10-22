<script setup lang="ts">
import { useLogtoUser } from "#imports";

const user = useLogtoUser();
</script>
<template>
    <div class="w-full">
        <div class="relative flex flex-col items-center justify-center w-full pt-20 pb-20">
            <div class="container relative z-10 flex flex-col items-center justify-center w-full h-full px-8 text-center">
                <h1 class="text-4xl font-bold text-center text-slate-800 dark:text-white md:text-5xl lg:text-6xl">
                    Welcome to your new application
                </h1>
                <p class="max-w-3xl mx-auto mt-4 text-lg text-center text-slate-500">
                    This is a simple landing page that you can use to get started with your new application.
                </p>
                <div class="flex items-center gap-4 mt-8">
                    <Button :as-child="true">
                        <a href="/sign-in">
                            <Icon name="streamline-logos:google-logo-solid" class="w-4 h-4 mr-2" />
                            Sign in using Google
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>