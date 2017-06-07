import Representation from 'representation';
import Github from 'representation-source-github';
import request from 'request-promise-native';

const token = process.env.GITHUB_TOKEN;

const github = new Github(
  {
    user: 'salimkayabasi',
    token,
  },
  request,
);

const representation = new Representation();
representation
  .addSource(github)
  .generate('/docs/me.json');
