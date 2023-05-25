FROM blendergrid/blender:latest
RUN apt update && apt install -y unzip curl
VOLUME /golem/input /golem/output
WORKDIR /golem/work
COPY cubes.blend '/golem/work/cubes.blend'