# Codprog Clone

In this Readme, we will guide you to setup your own supabase project using the
code provided in this repository. Codprog is a Learning Management System (LMS).
We will be using supabase to mimic the functionality of our LMS.

## Overview

This project utilizes Supabase for database and serverless functions. It
includes two Supabase Edge functions and a database migration that you can
deploy to your Supabase project.

## Table of Contents

- [Preface](#Preface)
- [Supabase Setup](#supabase-setup)
- [Database Migration](#database-migration)
- [Edge Functions](#edge-functions)

## Preface

Products Used apart from Supabase:

1. For Serving Videos we are going to use free version of Vimeo. You can use any
   video hosting solution for this purpose.
2. For Payments we are using Stripe due to its global Presence. Again you can
   use any Payment Gateway / Processor of your choice and update the edge
   functions accordingly.

That being said, if you are going to use this project in as-is basis then create
an account on both of the plaforms (Vimeo and stripe) apart from Supabase. Once
you create account with stripe, it's API Key and Webhook secret will be required
while setting up edge functions.

You can setup supabase to run locally as well for testing but that would be out
of scope for this tutorial because it would require docker installation as well.
We will focus on how to deploy the current migrations and edge functions to your
supabase project.

## Supabase Setup

1. **Clone this repository** to your local machine and navigate to supabase
   directory:

   ```shell
   git clone <repository-url>
   cd supabase
   ```

2. Install Supabase CLI

Please refer to
https://supabase.com/docs/guides/cli/getting-started?platform=npm#installing-the-supabase-cli
for more details. You can basically install it via NPM.

3. Create a Supabase Project

Go to supabase.com and setup your account if not already done. Start a new
supabase Project. Do note the password provided while creating the database as
will be required in further steps.

4. Supabase Link You will get your project reference Id easily from the supabase
   dashboard URL of project. Ex:
   https://supabase.com/dashboard/project/abcdefghijklmnop In this example
   project reference Id is abcdefghijklmnop

```shell
supabase link  --project-ref <provide-your-project-ref-id-here>
```

## Database Migration

Apply supabase migrations using the below command. You will be required to
supply for database password which you created in step 3 of supabase setup.

```shell
supabase db pull --debug --linked
```

## Edge Functions

Functions Directory contains two functions:

1. create-stripe-payment : Needed to create a order in our system as well as
   stripe's system. This Request will be triggered from our UI.
2. stripe-hooks : Needed to handle the updates from stripe for each order. We
   mark the order as completed only after we get the request from Stripe.

We need to deploy both of the functions to project.

1. First Step is to set the environment variables required by Edge Functions. We
   need to set STRIPE_API_KEY and STRIPE_WEBHOOK_SIGNING_SECRET apart from
   default supabase variables. You need to obtain the values from the Stripe
   Dashboard. You can use supabase secrets cli command to set these variables.

   ```shell
   supabase secrets set STRIPE_API_KEY=<stripe-api-key>
   supabase secrets set STRIPE_WEBHOOK_SIGNING_SECRET=<stripe-webhook-signing-secret>
   ```

2. Deploy the Edge Functions:
   ```shell
   supabase functions deploy create-stripe-payment  --import-map import_map.json
   supabase functions deploy stripe-hooks  --import-map import_map.json --no-verify-jwt
   ```
   Do note that we don't want to verify the token for stripe-hooks function.
