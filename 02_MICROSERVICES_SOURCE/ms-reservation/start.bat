@echo off
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
set "M2_HOME=C:\Users\user\tools\apache-maven-3.9.9"
set "PATH=%JAVA_HOME%\bin;%M2_HOME%\bin;%PATH%"

cd /d "c:\Users\user\OneDrive\Documents\SEMESTRE6\GENIE_LOGICIEL\ms-reservation"
"%M2_HOME%\bin\mvn.cmd" spring-boot:run
