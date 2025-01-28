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

1. **Clone this repository**

   Clone to your local machine and navigate to supabase directory:

   ```shell
   git clone <repository-url>
   cd supabase
   ```

2. Install Supabase CLI

   Please refer to
   https://supabase.com/docs/guides/cli/getting-started?platform=npm#installing-the-supabase-cli
   for more details. You can basically install it via NPM.

3. Install Docker Desktop

   Starting Supabase CLI version 1.123.4, you must have Docker Desktop installed
   to deploy Edge Functions. We need to deploy 2 edge functions. (See below). Go
   to [Get Docker Desktop](https://docs.docker.com/get-docker/) to download and
   install Docker desktop according to your operating system. If you don't want
   to install Docker Desktop, you can use an older version for supabase CLI in
   previous step.

4. Create a Supabase Project

   Go to supabase.com and setup your account if not already done. Start a new
   supabase Project. Do note the password provided while creating the database
   as will be required in further steps.

5. Perform login for supabase CLI

   This is a required only once for a development machine. This is required to
   authenticate the requests from Supabase CLI to Supabase Server. After running
   the below command, it will ask you to provide access token which can be
   obtained from
   [Supabase Access Token Dashboard](https://supabase.com/dashboard/account/tokens).
   Once token is created, provide it to cli so that it can be used by cli in
   subsequent commands.

   ```shell
   supabase login
   ```

6. Link Supabase Project

   You will get your project reference Id easily from the supabase dashboard URL
   of project. Ex: https://supabase.com/dashboard/project/abcdefghijklmnop In
   this example project reference Id is abcdefghijklmnop

   ```shell
   supabase link  --project-ref <provide-your-project-ref-id-here>
   ```

   It will prompt you to provide database password. You can provide the password
   from previous step or if you skip this time then you will need to provide it
   at time of applying database migrations.

## Database Migration

Apply supabase migrations using the below command. You will be required to
supply for database password which you created in step 3 of supabase setup.

```shell
supabase db push --debug --linked
```

## Edge Functions

Edge functions are helpful if we want to integrate with third party applications
like Stripe. Before starting to deploy our edge functions we need to obtain the
secrets from stripe for setting up order creation as well as webhook handling
flow.

1. **STRIPE_API_KEY:** Secret Key (Obtained from
   [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) for the test
   environment). Do note that we don't need Publishable Key here.

2. **STRIPE_WEBHOOK_SIGNING_SECRET:** Visit Stripe Dashboard in Test Mode and
   add the webhook that will be required for handing updates from stripe.
   Example:
   [https://&lt;project-ref-id&gt;.supabase.co/functions/v1/stripe-hooks](https://<project-ref-id>.supabase.co/functions/v1/stripe-hooks)
   . You need to add the below events for the webhook:
   - `charge.dispute.closed`
   - `charge.dispute.created`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `payment_intent.processing`

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
   supabase functions deploy create-stripe-payment
   supabase functions deploy stripe-hooks --no-verify-jwt
   ```
   Do note that we don't want to verify the token for stripe-hooks function.

## Postman Collection

We have included a Postman collection and an associated environment file in the `test-resources/postman-collection` folder. These files are named:

- **[Codprog_Clone_Supabase.postman_collection.json](test-resources/postman-collection/Codprog_Clone_Supabase.postman_collection.json)**
- **[Dev.postman_environment.json](test-resources/postman-collection/Dev.postman_environment.json)**

While we recommend creating your own Postman collection for testing and development, you can use the provided files as a reference. If you choose to import these collections, make sure to update the following environment variables in the **Dev Environment**:

1. **`codprog-clone-base-url`**: Replace with the base URL of your Supabase project in the format:  
   `https://<project-ref-id>.supabase.co`

2. **`supabase_codprog_api_key`**: Obtain this from the Supabase dashboard:  
   `Settings -> API -> Project API Keys -> anon / public`

3. **`supabase_codprog_api_key`** (for protected routes): This is the user token generated after logging in or signing up. Use this token for requests requiring authentication.
