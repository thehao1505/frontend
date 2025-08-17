pipeline {
  agent any

  stages {
    stage('Prepare .env') {
      steps {
        withCredentials([file(credentialsId: 'env.prod.fe', variable: 'ENV_FILE')]) {
          sh 'cp $ENV_FILE .env.prod'
        }
      }
    }

    stage('Deploy with docker compose') {
      steps {
        sh '''
        docker compose down
        docker compose up -d --build
        '''
      }
    }
  }

  post {
    always {
      echo 'Pipeline finished'
    }
  }
}